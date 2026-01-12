export type TicketListEvent = {
  type: "ticket:list";
  ts: number;
  userIds?: string[];
};

export type TicketDetailEvent = {
  type: "ticket:detail";
  id: string;
  ts: number;
  userIds?: string[];
};
