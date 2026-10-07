export interface RoutePlanPayload {
  id?: number;
  user_id?: number;
  origin_text?: string;
  destination_text?: string;
  route_mode?: string;
  estimated_minutes?: number;
  facility_ids?: number[];
}
