import { Event } from './event';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  [key: string]: any;
}

export interface EventsResponse extends ApiResponse<Event[]> {
  total?: number;
  skip?: number;
  limit?: number;
}

export interface AvailableTagsResponse extends ApiResponse<string[]> {
  tags?: string[];
}

export interface EventDetailResponse extends ApiResponse<Event> {}
