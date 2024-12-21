'use strict';
module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    'announcements',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      authorId: {
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
      },
      attachmentUrls: {
        type: DataTypes.JSON,
      },
      isPin: {
        type: DataTypes.BOOLEAN,
      },
      isShow: {
        type: DataTypes.BOOLEAN,
      },
      createdAt: {
        defaultValue: sequelize.fn('UNIX_TIMESTAMP'),
        type: DataTypes.INTEGER.UNSIGNED,
      },
      updatedAt: {
        defaultValue: sequelize.fn('UNIX_TIMESTAMP'),
        type: DataTypes.INTEGER.UNSIGNED,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
      paranoid: true,
    },
  );
  model.associate = function (models) {};
  return model;
};
