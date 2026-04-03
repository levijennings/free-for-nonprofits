/* eslint-disable */
import { vi } from 'vitest'

export function createMockSupabaseClient() {
  const mockQueryBuilder = {
    select: vi.fn(function () {
      return this
    }),
    from: vi.fn(function () {
      return this
    }),
    insert: vi.fn(function (_data: unknown) {
      return this
    }),
    update: vi.fn(function (_data: unknown) {
      return this
    }),
    delete: vi.fn(function () {
      return this
    }),
    eq: vi.fn(function (_column: string, _value: unknown) {
      return this
    }),
    order: vi.fn(function (_column: string, _options?: unknown) {
      return this
    }),
    range: vi.fn(function (_from: number, _to: number) {
      return this
    }),
    limit: vi.fn(function (_count: number) {
      return this
    }),
    single: vi.fn(async function () {
      return { data: null, error: null }
    }),
    maybeSingle: vi.fn(async function () {
      return { data: null, error: null }
    }),
    then: vi.fn(async function () {
      return { data: null, error: null }
    }),
  }

  return {
    from: vi.fn((_table: string) => ({ ...mockQueryBuilder })),
    select: vi.fn(function () {
      return this
    }),
    insert: vi.fn(function (_data: unknown) {
      return this
    }),
    update: vi.fn(function (_data: unknown) {
      return this
    }),
    delete: vi.fn(function () {
      return this
    }),
    eq: vi.fn(function (_column: string, _value: unknown) {
      return this
    }),
    order: vi.fn(function (_column: string, _options?: unknown) {
      return this
    }),
    range: vi.fn(function (_from: number, _to: number) {
      return this
    }),
    limit: vi.fn(function (_count: number) {
      return this
    }),
    single: vi.fn(async function () {
      return { data: null, error: null }
    }),
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: null },
        error: null,
      })),
      signUp: vi.fn(async () => ({
        data: { user: null },
        error: null,
      })),
      signInWithPassword: vi.fn(async () => ({
        data: { user: null, session: null },
        error: null,
      })),
      signOut: vi.fn(async () => ({
        error: null,
      })),
      resetPasswordForEmail: vi.fn(async () => ({
        data: {},
        error: null,
      })),
      verifyOtp: vi.fn(async () => ({
        data: { user: null, session: null },
        error: null,
      })),
    },
  }
}

export function createMockQueryBuilder() {
  return {
    select: vi.fn(function () {
      return this
    }),
    eq: vi.fn(function (_column: string, _value: unknown) {
      return this
    }),
    order: vi.fn(function (_column: string, _options?: unknown) {
      return this
    }),
    range: vi.fn(function (_from: number, _to: number) {
      return this
    }),
    limit: vi.fn(function (_count: number) {
      return this
    }),
    single: vi.fn(async function () {
      return { data: null, error: null }
    }),
    maybeSingle: vi.fn(async function () {
      return { data: null, error: null }
    }),
  }
}
