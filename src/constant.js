const STATUS_CODE = {
  ERROR: 400,
  SUCCESS: 200,
};

const DOC_STATUS = {
  active: 1,
  deleted: 0,
};

const DB_MODEL_REF = {
  USER: "UserProfile",
  MEDIA: "Media",
};

const AUTHORIZATION = {
  superadmin: [
    {
      id: "Dashboard",
      title: "Dashboard",
      type: "item",
      icon: "icons.MdDashboard",
      url: "/home/dashboard",
      access: 3,
    },
    {
      id: "Users",
      title: "Users",
      type: "item",
      icon: "icons.MdOutlineAdminPanelSettings",
      url: "/home/subAdmin",
      access: 3,
    },
  ],
};
const AllNotificationTypes = [
  {
    Type: "SMS/Text",
    active: true,
  },
  {
    Type: "WhatsApp",
    active: true,
  },
  {
    Type: "Email",
    active: false,
  },
];
const Notifications = [
  {
    Type: "All User SignUp",
    active: false,
  },
  {
    Type: "Todo Completed",
    active: false,
  },
  {
    Type: "New Todo Added",
    active: false,
  },
];

const MESSAGES = {
  KEY_EMPTY_INVALID: "{{key}} should not be empty",

  INVAILD_EMAIL: "Email is invaild",
  ARRKEY: "key should be an array",
};

const CSV_REF = {
  MAX_SIZE: 200 * 1024 * 1024, //200mb
  ALLOWED_TYPES: ["text/csv"],
};

module.exports = Object.freeze({
  STATUS_CODE,
  MESSAGES,
  DOC_STATUS,
  AUTHORIZATION,
  DB_MODEL_REF,
  AllNotificationTypes,
  Notifications,
  CSV_REF,
});
// ========================== Export Module End ============================
