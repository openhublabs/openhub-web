module.exports = (req, res) => {
  res.status(200).json({ ok: true, msg: 'CommonJS ping works' });
};
