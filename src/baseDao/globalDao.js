const mongoose = require("mongoose")
const baseDao = require("./baseDao")

class GlobalDao {
  constructor(modelName) {
    this.modelName = modelName
    this.model = mongoose.model(modelName)
  }

  findOne(query, project = {}) {
    return this.model
      .findOne(query, project)
      .lean()
      .then((result) => result)
      .catch((error) => {
        throw new Error(`FindOne failed for ${this.modelName}: ${error.message}`)
      })
  }

  findById(query) {
    return this.model
      .findById(query._id || query)
      .lean()
      .then((result) => result)
      .catch((error) => {
        throw new Error(`FindById failed for ${this.modelName}: ${error.message}`)
      })
  }

  find(query, project = {}, paginate = {}) {
    let mongoQuery = this.model.find(query, project).lean()

    if (paginate.limit) {
      mongoQuery = mongoQuery.limit(paginate.limit)
    }
    if (paginate.skip) {
      mongoQuery = mongoQuery.skip(paginate.skip)
    }

    return mongoQuery
      .then((result) => result)
      .catch((error) => {
        throw new Error(`Find failed for ${this.modelName}: ${error.message}`)
      })
  }

  insertMany(data) {
    return this.model
      .insertMany(data)
      .then((result) => result)
      .catch((error) => {
        throw new Error(`InsertMany failed for ${this.modelName}: ${error.message}`)
      })
  }

  updateOne(query, update, options = {}) {
    return this.model
      .updateOne(query, update, options)
      .then((result) => result)
      .catch((error) => {
        throw new Error(`UpdateOne failed for ${this.modelName}: ${error.message}`)
      })
  }

  updateMany(query, update, options = {}) {
    return this.model
      .updateMany(query, update, options)
      .then((result) => result)
      .catch((error) => {
        throw new Error(`UpdateMany failed for ${this.modelName}: ${error.message}`)
      })
  }

  findOneAndUpdate(query, update, options = { new: true }) {
    return this.model
      .findOneAndUpdate(query, update, options)
      .lean()
      .then((result) => result)
      .catch((error) => {
        throw new Error(`FindOneAndUpdate failed for ${this.modelName}: ${error.message}`)
      })
  }

  findByIdAndUpdate(query, update, options = { new: true }) {
    return this.model
      .findByIdAndUpdate(query._id || query, update, options)
      .lean()
      .then((result) => result)
      .catch((error) => {
        throw new Error(`FindByIdAndUpdate failed for ${this.modelName}: ${error.message}`)
      })
  }

  deleteOne(query) {
    return this.model
      .deleteOne(query)
      .then((result) => result)
      .catch((error) => {
        throw new Error(`DeleteOne failed for ${this.modelName}: ${error.message}`)
      })
  }

  create(data) {
    return this.model
      .create(data)
      .then((result) => result.toObject())
      .catch((error) => {
        throw new Error(`Create failed for ${this.modelName}: ${error.message}`)
      })
  }
}

const createDao = (modelName) => {
  const dao = new GlobalDao(modelName)
  const baseDaoOperations = baseDao(dao)

  return {
    ...baseDaoOperations,
    // Direct access to core operations
    create: (data) => dao.create(data),
    findOne: (query, project) => dao.findOne(query, project),
    findById: (query) => dao.findById(query),
    find: (query, project, paginate) => dao.find(query, project, paginate),
    insertMany: (data) => dao.insertMany(data),
    updateOne: (query, update, options) => dao.updateOne(query, update, options),
    updateMany: (query, update, options) => dao.updateMany(query, update, options),
    findOneAndUpdate: (query, update, options) => dao.findOneAndUpdate(query, update, options),
    findByIdAndUpdate: (query, update, options) => dao.findByIdAndUpdate(query, update, options),
    deleteOne: (query) => dao.deleteOne(query),
  }
}

module.exports = createDao
