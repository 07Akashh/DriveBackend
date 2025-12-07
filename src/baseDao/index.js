module.exports = (dao) => {
  return {
    getByEmail: (loginInfo) => {
      const query = { isDeleted: false, status: true };
      query.email = loginInfo.email;
      return dao.findOne(query);
    },
    getById: (id) => {
      const query = { _id: id };
      return dao.findById(query);
    },
    getByIdadmin: (info) => {
      const query = { _id: info.admin_id };
      return dao.findById(query);
    },
    getByIduser: (info) => {
      const query = { _id: info.user_id };
      return dao.findById(query);
    },

    updateUser: (info, option = {}) => {
      const query = {
          _id: info.user_id,
        },
        update = info.update;
      return dao.findByIdAndUpdate(query, update);
    },
    //update
    updateToken: (info) => {
      const query = {
          email: info.email,
          isDeleted: false,
          status: true,
        },
        update = {
          "frgt_pass.tkn": info.tkn,
          "frgt_pass.tknTime": new Date(),
        };
      return dao.findOneAndUpdate(query, update);
    },
    getByTkn: (info) => {
      const query = {
        "frgt_pass.tkn": info.tkn,
      };
      return dao.findOne(query);
    },
    insertMany: (data) => dao.insertMany(data),
    updateMany: (query, update, options = {}) =>
      dao.updateMany(query, update, options),
    getMany: (query, project = {}, paginate = {}) =>
      dao.find(query, project, paginate),
    getManyWithSort: (query, project = {}, paginate = {}, sort = {}) =>
      dao.find(query, project, paginate).sort(sort),
    updateOne: (query, update, option) => dao.updateOne(query, update, option),
    findOneAndUpdate: (query, update, option) =>
      dao.findOneAndUpdate(query, update, option),
    findByIdAndUpdate: (query, update, option) =>
      dao.findByIdAndUpdate(query, update, option),
    getOne: (query, project = {}) => dao.findOne(query, project),
    deleteOne: (query, project = {}) => dao.deleteOne(query, project),
  };
};
