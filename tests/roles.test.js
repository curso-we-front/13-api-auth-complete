const { authorize } = require('../src/middlewares/authorize');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockReq(role) {
  return { user: { id: '507f1f77bcf86cd799439011', role } };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ─── authorize ────────────────────────────────────────────────────────────────

describe('authorize middleware', () => {
  it('llama a next() si el rol está en la lista', () => {
    const next = jest.fn();
    authorize('admin', 'editor')(mockReq('editor'), mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('responde 403 si el rol no está en la lista', () => {
    const next = jest.fn();
    const res = mockRes();
    authorize('admin')(mockReq('user'), res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('responde 403 si req.user no tiene role', () => {
    const next = jest.fn();
    const res = mockRes();
    const req = { user: { id: '123' } };
    authorize('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('responde 403 si req.user es undefined', () => {
    const next = jest.fn();
    const res = mockRes();
    authorize('admin')({ user: undefined }, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('funciona con un único rol permitido', () => {
    const next = jest.fn();
    authorize('admin')(mockReq('admin'), mockRes(), next);
    expect(next).toHaveBeenCalled();
  });
});
