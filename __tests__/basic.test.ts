describe('Basic Test', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should confirm Next.js environment', () => {
    expect(process.env.NODE_ENV).toBe('test')
  })
})
