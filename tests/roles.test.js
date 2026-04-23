const { authorize, isOwnerOrAdmin } = require('../src/middlewares/authorize');

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

// ─── isOwnerOrAdmin ───────────────────────────────────────────────────────────

describe('isOwnerOrAdmin middleware', () => {
  const userId = '507f1f77bcf86cd799439011';
  const otherId = '507f1f77bcf86cd799439012';

  function makeModel(resource) {
    return { findById: jest.fn().mockResolvedValue(resource) };
  }

  function mockReqWithParams(role, id, paramValue = 'abc123') {
    return { user: { id, role }, params: { id: paramValue } };
  }

  it('responde 404 si el recurso no existe', async () => {
    const next = jest.fn();
    const res = mockRes();
    await isOwnerOrAdmin(makeModel(null))(mockReqWithParams('user', userId), res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  it('llama a next() si el usuario es admin aunque no sea dueño', async () => {
    const next = jest.fn();
    await isOwnerOrAdmin(makeModel({ userId: otherId }))(
      mockReqWithParams('admin', userId),
      mockRes(),
      next,
    );
    expect(next).toHaveBeenCalled();
  });

  it('llama a next() si el usuario es el dueño por userId', async () => {
    const next = jest.fn();
    await isOwnerOrAdmin(makeModel({ userId }))(
      mockReqWithParams('user', userId),
      mockRes(),
      next,
    );
    expect(next).toHaveBeenCalled();
  });

  it('llama a next() si el usuario es el dueño por authorId', async () => {
    const next = jest.fn();
    await isOwnerOrAdmin(makeModel({ authorId: userId }))(
      mockReqWithParams('user', userId),
      mockRes(),
      next,
    );
    expect(next).toHaveBeenCalled();
  });

  it('responde 403 si no es dueño ni admin', async () => {
    const next = jest.fn();
    const res = mockRes();
    await isOwnerOrAdmin(makeModel({ userId: otherId }))(
      mockReqWithParams('user', userId),
      res,
      next,
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('usa paramKey personalizado para buscar el recurso', async () => {
    const next = jest.fn();
    const model = makeModel({ userId });
    const req = { user: { id: userId, role: 'user' }, params: { articleId: 'abc123' } };
    await isOwnerOrAdmin(model, 'articleId')(req, mockRes(), next);
    expect(model.findById).toHaveBeenCalledWith('abc123');
    expect(next).toHaveBeenCalled();
  });
});
