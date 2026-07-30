import { describe, it, expect } from 'vitest'
import { DEFAULT_NEXT, nextQuery, nextRedirectUrl, safeNextPath } from '@/components/auth/next-param'

const TAB = String.fromCharCode(9)
const LF = String.fromCharCode(10)
const CR = String.fromCharCode(13)

describe('safeNextPath', () => {
  it('keeps same-origin paths, including query and hash', () => {
    expect(safeNextPath('/dashboard')).toBe('/dashboard')
    expect(safeNextPath('/tools/google-workspace')).toBe('/tools/google-workspace')
    expect(safeNextPath('/tools/canva?step=2#claim')).toBe('/tools/canva?step=2#claim')
  })

  it('rejects absolute URLs pointing at another origin', () => {
    expect(safeNextPath('https://evil.example/login')).toBe(DEFAULT_NEXT)
    expect(safeNextPath('http://evil.example')).toBe(DEFAULT_NEXT)
    expect(safeNextPath('javascript:alert(1)')).toBe(DEFAULT_NEXT)
    expect(safeNextPath('data:text/html,<script>')).toBe(DEFAULT_NEXT)
  })

  it('rejects protocol-relative and backslash-smuggled hosts', () => {
    expect(safeNextPath('//evil.example')).toBe(DEFAULT_NEXT)
    expect(safeNextPath('/\\evil.example')).toBe(DEFAULT_NEXT)
    expect(safeNextPath('\\/evil.example')).toBe(DEFAULT_NEXT)
    expect(safeNextPath('/\\/evil.example')).toBe(DEFAULT_NEXT)
  })

  it('rejects relative paths, empty values and non-strings', () => {
    expect(safeNextPath('dashboard')).toBe(DEFAULT_NEXT)
    expect(safeNextPath('')).toBe(DEFAULT_NEXT)
    expect(safeNextPath(undefined)).toBe(DEFAULT_NEXT)
    expect(safeNextPath(null)).toBe(DEFAULT_NEXT)
    expect(safeNextPath(42)).toBe(DEFAULT_NEXT)
    expect(safeNextPath({ toString: () => '/dashboard' })).toBe(DEFAULT_NEXT)
  })

  it('rejects control characters used to smuggle a scheme past a URL parser', () => {
    expect(safeNextPath('/' + TAB + 'evil')).toBe(DEFAULT_NEXT)
    expect(safeNextPath('/foo' + LF + 'Set-Cookie: x=1')).toBe(DEFAULT_NEXT)
    expect(safeNextPath('/foo' + CR + 'bar')).toBe(DEFAULT_NEXT)
  })

  it('trims surrounding whitespace, then validates what it will actually return', () => {
    // The trimmed value is the value we return, so trimming first cannot
    // smuggle anything past the checks below it.
    expect(safeNextPath(' /foo' + CR + LF)).toBe('/foo')
    expect(safeNextPath(TAB + '//evil.example')).toBe(DEFAULT_NEXT)
  })

  it('honours a caller-supplied fallback', () => {
    expect(safeNextPath('https://evil.example', '/login')).toBe('/login')
  })
})

describe('nextRedirectUrl', () => {
  it('always resolves against our own origin', () => {
    expect(nextRedirectUrl('/tools/canva', 'https://app.example')).toBe('https://app.example/tools/canva')
    expect(nextRedirectUrl('https://evil.example', 'https://app.example')).toBe('https://app.example/dashboard')
    expect(nextRedirectUrl('//evil.example', 'https://app.example')).toBe('https://app.example/dashboard')
  })
})

describe('nextQuery', () => {
  it('omits the parameter when the destination is the default', () => {
    expect(nextQuery(DEFAULT_NEXT)).toBe('')
    expect(nextQuery('')).toBe('')
    expect(nextQuery(undefined)).toBe('')
  })

  it('encodes the value and honours the separator', () => {
    expect(nextQuery('/tools/canva?step=2')).toBe('?next=%2Ftools%2Fcanva%3Fstep%3D2')
    expect(nextQuery('/tools/canva', '&')).toBe('&next=%2Ftools%2Fcanva')
  })
})
