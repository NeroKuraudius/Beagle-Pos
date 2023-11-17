module.exports = {
  apiErrorHandler(error, req, res, next) {
    if (error instanceof Error) {
      res.status(error.status || 500).json({
        status: error.status,
        message: `${error.name}: ${error.message}`
      })
    } else {
      res.status(500).json({
        status: 500,
        message: `${error}`
      })
    }
    next(error)
  }
}