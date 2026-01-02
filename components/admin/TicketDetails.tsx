import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { Ticket } from './TicketManagement';
import { Calendar, User, Send, Paperclip, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { RichTextEditor } from '../ui/rich-text-editor';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTicketSse } from '@/lib/use-ticket-sse';

interface TicketDetailsProps {
  ticket: Ticket;
  onClose: () => void;
  userRole: 'admin' | 'partner';
}

export function TicketDetails({ ticket, onClose, userRole }: TicketDetailsProps) {
  const { t } = useTranslation();
  const [localTicket, setLocalTicket] = useState<Ticket>(ticket);
  const [newComment, setNewComment] = useState('');
  const [newLog, setNewLog] = useState('');
  const [uploading, setUploading] = useState(false);
  const [logFiles, setLogFiles] = useState<File[]>([]);
  const [commentFiles, setCommentFiles] = useState<File[]>([]);
  const logListRef = useRef<HTMLDivElement | null>(null);
  const commentListRef = useRef<HTMLDivElement | null>(null);

  const { data, refetch } = useQuery({
    queryKey: ["ticket", ticket.id],
    queryFn: async () => {
      const res = await fetch(`/api/tickets/${ticket.id}`);
      if (!res.ok) throw new Error("Failed to load ticket");
      const json = await res.json();
      return {
        ...json,
        logs: json.logs ?? [],
        comments: json.comments ?? [],
        attachments: json.attachments ?? [],
      } as Ticket;
    },
    initialData: ticket,
    staleTime: 0,
  });

  useTicketSse(ticket.id, () => {
    refetch();
  });

  const statusMutation = useMutation<Ticket, Error, string>({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/tickets/${ticket.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('status_failed');
      return res.json();
    },
    onMutate: async (status) => {
      const previous = localTicket;
      const optimistic = { ...localTicket, status: status as Ticket['status'] };
      setLocalTicket(optimistic);
      return { previous };
    },
    onSuccess: (updated) => {
      setLocalTicket(updated);
      toast.success(t('admin.ticketDetails.statusUpdated'));
    },
  });

  const commentMutation = useMutation<Ticket, Error, { message: string; attachments: Array<{ name: string; type: string; url: string }> }>({
    mutationFn: async (payload) => {
      const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('comment_failed');
      return res.json();
    },
    onSuccess: (updated) => {
      setLocalTicket(updated);
      setNewComment('');
      setCommentFiles([]);
      toast.success(t('admin.ticketDetails.commentAdded'));
    },
    onError: () => {
      toast.error(t('common.error', { defaultValue: 'Failed to add comment' }));
    },
  });

  const logMutation = useMutation<Ticket, Error, { message: string; attachments: Array<{ name: string; type: string; url: string }> }>({
    mutationFn: async (payload) => {
      const res = await fetch(`/api/tickets/${ticket.id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('log_failed');
      return res.json();
    },
    onSuccess: (updated) => {
      setLocalTicket(updated);
      setNewLog('');
      setLogFiles([]);
      toast.success(t('admin.ticketDetails.logAdded'));
    },
    onError: () => {
      toast.error(t('common.error', { defaultValue: 'Failed to add log' }));
    },
  });

  useEffect(() => {
    if (data) {
      setLocalTicket(data);
    }
  }, [data]);

  const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
    const el = ref.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom(logListRef);
  }, [localTicket.logs.length]);

  useEffect(() => {
    scrollToBottom(commentListRef);
  }, [localTicket.comments.length]);

  const handleStatusChange = async (status: string) => {
    await statusMutation.mutateAsync(status);
  };

  const handleAddComment = async () => {
    const plain = newComment.replace(/<[^>]+>/g, '').trim();
    if (!plain) return;
    
    let uploadedAttachments: Array<{ name: string; type: string; url: string }> = [];
    if (commentFiles.length) {
      setUploading(true);
      try {
        uploadedAttachments = await Promise.all(commentFiles.map(uploadToS3));
      } catch (err) {
        toast.error(t('admin.ticketDetails.uploadFailed'));
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    await commentMutation.mutateAsync({ message: newComment, attachments: uploadedAttachments });
  };

  const handleAddLog = async () => {
    const plain = newLog.replace(/<[^>]+>/g, '').trim();
    if (!plain) return;
    
    let uploadedAttachments: Array<{ name: string; type: string; url: string }> = [];
    if (logFiles.length) {
      setUploading(true);
      try {
        uploadedAttachments = await Promise.all(logFiles.map(uploadToS3));
      } catch (err) {
        toast.error(t('admin.ticketDetails.uploadFailed'));
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    await logMutation.mutateAsync({ message: newLog, attachments: uploadedAttachments });
  };

  const uploadToS3 = async (file: File) => {
    const presignRes = await fetch('/api/uploads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: file.name, type: file.type }),
    });

    if (!presignRes.ok) throw new Error('presign_failed');
    const { uploadUrl, viewUrl, key } = await presignRes.json();

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!uploadRes.ok) throw new Error('upload_failed');

    return { name: file.name, type: file.type.startsWith('image/') ? 'image' : 'document', url: key, inlineUrl: viewUrl };
  };

  const uploadAndSaveAttachment = async (file: File) => {
    const uploaded = await uploadToS3(file);
    const saveRes = await fetch(`/api/tickets/${localTicket.id}/attachments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: uploaded.name, type: uploaded.type, key: uploaded.url }),
    });
    if (!saveRes.ok) throw new Error('save_failed');
    const updated = await saveRes.json();
    setLocalTicket(updated);
        return uploaded;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      await uploadAndSaveAttachment(file);
      toast.success(t('admin.ticketDetails.attachmentUploaded'));
    } catch (error) {
      toast.error(t('admin.ticketDetails.uploadFailed'));
    } finally {
      setUploading(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return t('admin.ticketDetails.status.open');
      case 'in_progress': return t('admin.ticketDetails.status.in_progress');
      case 'completed': return t('admin.ticketDetails.status.completed');
      case 'closed': return t('admin.ticketDetails.status.closed');
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm w-full h-full flex flex-col">
      <div className="px-6 py-4 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('common.back', { defaultValue: 'Back' })}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{localTicket.projectName}</p>
            <h2 className="text-xl font-semibold leading-tight">{localTicket.title}</h2>
            <div className="flex flex-wrap gap-2 pt-1 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {t('admin.ticketDetails.createdDate')}: {localTicket.createdDate}
              </span>
              <span className="inline-flex items-center gap-1">
                <User className="w-4 h-4" />
                {localTicket.assignees.length} {t('admin.ticketManagement.users') ?? 'Assignees'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {userRole === 'admin' ? (
            <Select value={localTicket.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">{t('admin.ticketDetails.status.open')}</SelectItem>
                <SelectItem value="in_progress">{t('admin.ticketDetails.status.in_progress')}</SelectItem>
                <SelectItem value="completed">{t('admin.ticketDetails.status.completed')}</SelectItem>
                <SelectItem value="closed">{t('admin.ticketDetails.status.closed')}</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge className={getStatusColor(localTicket.status)}>{getStatusText(localTicket.status)}</Badge>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid lg:grid-cols-3 gap-4 h-full">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('admin.ticketDetails.description')}</p>
                  <p className="text-sm leading-6 whitespace-pre-line">{localTicket.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {localTicket.assignees.map((assignee) => (
                    <Badge key={assignee.id} variant="outline">
                      {assignee.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="logs" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="logs" className="flex-1">
                  {t('admin.ticketDetails.workLogs')} ({localTicket.logs.length})
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex-1">
                  {t('admin.ticketDetails.comments')} ({localTicket.comments.length})
                </TabsTrigger>
                <TabsTrigger value="attachments" className="flex-1">
                  {t('admin.ticketDetails.attachments')} ({localTicket.attachments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="logs" className="space-y-4">
                <div ref={logListRef} className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {localTicket.logs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{log.userName}</span>
                          </div>
                          <span className="text-sm text-gray-600">{log.date}</span>
                        </div>
                        <div className="text-sm leading-6 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: log.message }} />
                      </CardContent>
                    </Card>
                  ))}
                  {localTicket.logs.length === 0 && (
                    <p className="text-center text-gray-500 py-8">{t('admin.ticketDetails.noLogs')}</p>
                  )}
                </div>
                {(userRole === 'partner' || userRole === 'admin') && (
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{t('admin.ticketDetails.addLog')}</p>
                          <p className="text-xs text-gray-500">{t('admin.ticketDetails.logPlaceholder')}</p>
                        </div>
                        {logFiles.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {logFiles.length} {t('admin.ticketDetails.files') ?? 'files'}
                          </Badge>
                        )}
                      </div>
                      <div className="rounded-lg border bg-gray-50 p-3 space-y-3">
                        <RichTextEditor
                          value={newLog}
                          onChange={setNewLog}
                          placeholder={t('admin.ticketDetails.logPlaceholder')}
                          onAttachUpload={async (files) => {
                            setLogFiles(files);
                            const uploads = await Promise.all(files.map(uploadAndSaveAttachment));
                            return uploads.map((u) => ({ src: u.inlineUrl || u.url }));
                          }}
                        />
                        {logFiles.length ? (
                          <div className="flex flex-wrap gap-2">
                            {logFiles.map((file) => (
                              <Badge key={file.name} variant="outline" className="flex items-center gap-2">
                                <Paperclip className="w-3 h-3" />
                                <span className="truncate max-w-[140px]">{file.name}</span>
                                <button
                                  type="button"
                                  className="text-xs text-gray-600"
                                  onClick={() => setLogFiles((prev) => prev.filter((f) => f.name !== file.name))}
                                >
                                  {t('admin.ticketDetails.removeFile')}
                                </button>
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">{t('admin.ticketDetails.uploadHint')}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">{t('admin.ticketDetails.editorHint') ?? 'Supports markdown, paste images.'}</p>
                          <Button
                            onClick={handleAddLog}
                            disabled={uploading || logMutation.isPending}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {t('admin.ticketDetails.addLogBtn')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="comments" className="space-y-4">
                <div ref={commentListRef} className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {localTicket.comments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{comment.userName}</span>
                            <Badge variant="outline" className="text-xs">
                              {comment.userRole === 'admin' ? t('admin.ticketDetails.roles.admin') : t('admin.ticketDetails.roles.partner')}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-600">{comment.date}</span>
                        </div>
                        <div className="text-sm leading-6 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: comment.message }} />
                      </CardContent>
                    </Card>
                  ))}
                  {localTicket.comments.length === 0 && (
                    <p className="text-center text-gray-500 py-8">{t('admin.ticketDetails.noComments')}</p>
                  )}
                </div>

                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{t('admin.ticketDetails.addComment')}</p>
                        <p className="text-xs text-gray-500">{t('admin.ticketDetails.commentPlaceholder')}</p>
                      </div>
                      {commentFiles.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {commentFiles.length} {t('admin.ticketDetails.files') ?? 'files'}
                        </Badge>
                      )}
                    </div>
                    <div className="rounded-lg border bg-gray-50 p-3 space-y-3">
                      <RichTextEditor
                        value={newComment}
                        onChange={setNewComment}
                        placeholder={t('admin.ticketDetails.commentPlaceholder')}
                        onAttachUpload={async (files) => {
                          setCommentFiles(files);
                          const uploads = await Promise.all(files.map(uploadAndSaveAttachment));
                          return uploads.map((u) => ({ src: u.inlineUrl || u.url }));
                        }}
                      />
                      {commentFiles.length ? (
                        <div className="flex flex-wrap gap-2">
                          {commentFiles.map((file) => (
                            <Badge key={file.name} variant="outline" className="flex items-center gap-2">
                              <Paperclip className="w-3 h-3" />
                              <span className="truncate max-w-[140px]">{file.name}</span>
                              <button
                                type="button"
                                className="text-xs text-gray-600"
                                onClick={() => setCommentFiles((prev) => prev.filter((f) => f.name !== file.name))}
                              >
                                {t('admin.ticketDetails.removeFile')}
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">{t('admin.ticketDetails.uploadHint')}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{t('admin.ticketDetails.editorHint') ?? 'Supports markdown, paste images.'}</p>
                        <Button
                          onClick={handleAddComment}
                          disabled={uploading || commentMutation.isPending}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {t('admin.ticketDetails.sendComment')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attachments" className="space-y-4">
                {(userRole === 'partner' || userRole === 'admin') && (
                  <Card>
                    <CardContent className="pt-6">
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition">
                          <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">{t('admin.ticketDetails.uploadPrompt')}</p>
                          <p className="text-xs text-gray-500 mt-1">{t('admin.ticketDetails.uploadHint')}</p>
                        </div>
                        <Input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                          disabled={uploading}
                        />
                      </Label>
                      {uploading && (
                        <p className="text-xs text-gray-500 mt-2">{t('admin.ticketDetails.uploading')}</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-80 overflow-y-auto pr-1">
                  {localTicket.attachments.map((attachment) => (
                    <Card key={attachment.id} className="hover:border-green-500 transition">
                      <CardContent className="pt-4">
                        {attachment.type === 'image' ? (
                          <img src={attachment.url} alt={attachment.name} className="w-full h-32 object-cover rounded mb-2" />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center mb-2">
                            <Paperclip className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <a href={attachment.url} target="_blank" rel="noreferrer" className="text-sm truncate hover:underline">
                          {attachment.name}
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                  {localTicket.attachments.length === 0 && (
                    <p className="col-span-full text-center text-gray-500 py-8">{t('admin.ticketDetails.noAttachments')}</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{t('admin.ticketDetails.workLogs')}</p>
                  <span className="text-xs text-gray-500">{localTicket.logs.length}</span>
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {localTicket.logs.slice(0, 3).map((log) => (
                    <div key={log.id} className="text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{log.userName}</span>
                        <span className="text-xs text-gray-500">{log.date}</span>
                      </div>
                      <p className="text-gray-600">{log.message}</p>
                    </div>
                  ))}
                  {localTicket.logs.length === 0 && (
                    <p className="text-gray-500 text-sm">{t('admin.ticketDetails.noLogs')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
