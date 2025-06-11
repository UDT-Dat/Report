import { getQueryFromStatus } from '@/lib/utils';

import { fetchApi } from '../api';
import { Event } from '../types';

export interface EventFilters {
  page?: number;
  limit?: number;
  title?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  status?: 'upcoming' | 'ongoing' | 'past' | 'cancelled';
}

export interface EventResponse {
  events: Event[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface CreateEventData {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  maxParticipants?: number;
  file?: File;
}

export interface UpdateEventData extends Partial<CreateEventData> { }

type TokensType = { accessToken: string | undefined; refreshToken: string | undefined } | null;

export const eventService = {
  // Lấy danh sách events với phân trang và bộ lọc
  async getEvents(filters: EventFilters = {}, tokens: TokensType = null): Promise<EventResponse> {
    const queryParams = new URLSearchParams();

    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.title) queryParams.append('title_like', filters.title);
    if (filters.location) queryParams.append('location_like', filters.location);
    const statusQuery = getQueryFromStatus(filters.status as string);
    Object.entries(statusQuery).forEach(([key, value]) => {
      queryParams.append(key, value.toString());
    });

    const response = await fetchApi(`/events?${queryParams.toString()}`, {
      method: 'GET',
    }, tokens);

    return response.result;
  },

  // Lấy chi tiết một event
  async getEvent(id: string, tokens: TokensType = null): Promise<Event> {
    const response = await fetchApi(`/events/${id}`, {
      method: 'GET',
    }, tokens);

    return response.result;
  },

  // Tạo event mới
  async createEvent(data: CreateEventData, tokens: TokensType = null): Promise<Event> {
    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('location', data.location);
    formData.append('startDate', data.startDate);
    formData.append('endDate', data.endDate);

    if (data.maxParticipants) {
      formData.append('maxParticipants', data.maxParticipants.toString());
    }

    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await fetchApi('/events', {
      method: 'POST',
      body: formData,
    }, tokens);

    return response.result;
  },

  // Cập nhật event
  async updateEvent(id: string, data: UpdateEventData, tokens: TokensType = null): Promise<Event> {
    const formData = new FormData();

    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.location) formData.append('location', data.location);
    if (data.startDate) formData.append('startDate', data.startDate);
    if (data.endDate) formData.append('endDate', data.endDate);
    if (data.maxParticipants) formData.append('maxParticipants', data.maxParticipants.toString());
    if (data.file) formData.append('file', data.file);

    const response = await fetchApi(`/events/${id}`, {
      method: 'PUT',
      body: formData,
    }, tokens);

    return response.result;
  },

  // Xóa event
  async deleteEvent(id: string, tokens: TokensType = null): Promise<Event> {
    const response = await fetchApi(`/events/${id}`, {
      method: 'DELETE',
    }, tokens);

    return response.result;
  },

  // Tham gia event
  async joinEvent(id: string, tokens: TokensType = null): Promise<Event> {
    const response = await fetchApi(`/events/${id}/join`, {
      method: 'POST',
    }, tokens);

    return response.result;
  },

  // Rời khỏi event
  async leaveEvent(id: string, tokens: TokensType = null): Promise<Event> {
    const response = await fetchApi(`/events/${id}/leave`, {
      method: 'POST',
    }, tokens);

    return response.result;
  },

  // Kiểm tra đã tham gia event chưa
  async checkParticipation(id: string, tokens: TokensType = null): Promise<boolean> {
    const response = await fetchApi(`/events/${id}/is-participant`, {
      method: 'GET',
    }, tokens);

    return response.result;
  },

  // Lấy danh sách participants của event với phân trang
  async getEventParticipants(id: string, filters: { page?: number; limit?: number; search?: string } = {}, tokens: TokensType = null): Promise<{
    participants: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
    };
  }> {
    const queryParams = new URLSearchParams();

    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.search) queryParams.append('search', filters.search);

    const response = await fetchApi(`/events/${id}/participants?${queryParams.toString()}`, {
      method: 'GET',
    }, tokens);

    return response.result;
  }
}; 