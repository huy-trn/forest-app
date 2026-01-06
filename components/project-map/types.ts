export type PolygonPoint = { lat: number; lng: number };

export type ProjectData = {
  area: string | null;
  title: string;
  id: string;
  description: string | null;
  createdAt: Date;
  updatedAt?: Date;
  country: string | null;
  province: string | null;
  forestType?: "natural" | "artificial";
};

export type ProjectLocation = {
  id: string;
  latitude: number;
  longitude: number;
  label?: string | null;
  name?: string | null;
  description?: string | null;
  polygon?: PolygonPoint[] | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectLocationVersion = {
  id: string;
  locationId: string;
  projectId: string;
  userId?: string | null;
  user?: { id: string; name: string | null; email: string | null } | null;
  operation: string;
  latitude: number;
  longitude: number;
  label?: string | null;
  name?: string | null;
  description?: string | null;
  polygon?: PolygonPoint[] | null;
  createdAt: string;
  location?: { id: string; name?: string | null; label?: string | null; latitude: number; longitude: number } | null;
};

export type ProjectSnapshot = {
  id: string;
  createdAt: string;
  operation: string;
  locationId: string;
  locationName?: string | null;
  user?: { id: string; name: string | null; email: string | null } | null;
  locations: ProjectLocation[];
};
