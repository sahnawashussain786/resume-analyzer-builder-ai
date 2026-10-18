export const notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

export const errorHandler = (err, req, res, next) => {
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id format' });
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ message: `That ${field} is already in use` });
  }
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message: msg });
  }
  console.error('💥', err);
  res.status(err.statusCode || 500).json({ message: err.message || 'Something went wrong on the server' });
};
