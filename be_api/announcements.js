'use strict';

const fp = require('lodash/fp');
const _ = require('lodash');
const { Router } = require('express');
const router = Router();
const {
  ROLE,
  response,
  getAnnouncements,
  getAnnouncement,
  PERMISSION,
  checkPermission,
} = require('../../lib/repositoy');

const {
  oms: { announcements: Announcements, Sequelize },
} = require('oms-db');
const { makeAnnouncement } = require('../../lib/formatter');
const moment = require('moment');
const { like, or, between } = Sequelize.Op;
const camelCaseKeys = fp.mapKeys(fp.camelCase);
const omitUndefined = fp.omitBy(_.isUndefined);

router.get(
  '/',
  response(async req => {
    await checkPermission(
      req,
      PERMISSION.BLOCK.ANNOUNCEMENT,
      PERMISSION.ACTION.READ,
    );

    const keyword = _.get(req, 'query.keyword');
    const createdAt = _.get(req, 'query.created_at');
    const isShow = _.get(req, 'query.is_show');
    const { id, role } = req.auth;

    const date = moment.unix(createdAt).utcOffset(8);

    return Announcements.findAll({
      where: omitUndefined({
        isShow: role === ROLE.HEADQUARTERS ? isShow : true,
        ...(keyword
          ? {
              [or]: [
                { title: { [like]: `%${keyword}%` } },
                { description: { [like]: `%${keyword}%` } },
              ],
            }
          : undefined),
        ...(createdAt
          ? {
              [between]: [
                date
                  .clone()
                  .startOf('day')
                  .unix(),
                date
                  .clone()
                  .endOf('day')
                  .unix(),
              ],
            }
          : undefined),
      }),
      order: [['isPin', 'DESC'], ['createdAt', 'DESC']],
    })
      .then(fp.map('id'))
      .then(getAnnouncements)
      .then(fp.map(makeAnnouncement));
  }),
);

router.get(
  '/:announcementId',
  response(async req => {
    await checkPermission(
      req,
      PERMISSION.BLOCK.ANNOUNCEMENT,
      PERMISSION.ACTION.READ,
    );

    const announcementId = _.get(req, 'params.announcementId');
    const { role } = req.auth;

    return Announcements.findOne({
      rejectOnEmpty: true,
      where: omitUndefined({
        id: announcementId,
        isShow: role === ROLE.HEADQUARTERS ? undefined : true,
      }),
    })
      .then(fp.get('id'))
      .then(getAnnouncement)
      .then(makeAnnouncement)
      .catch(error => {
        if (error instanceof Sequelize.EmptyResultError) {
          throw 404;
        }
        console.error(error);
        throw error;
      });
  }),
);

router.post(
  '/',
  response(async req => {
    await checkPermission(
      req,
      PERMISSION.BLOCK.ANNOUNCEMENT,
      PERMISSION.ACTION.CREATE,
    );

    const { title, description, attachmentUrls, isPin, isShow } = camelCaseKeys(
      req.body,
    );
    const { id } = req.auth;

    const recode = omitUndefined({
      title,
      authorId: id,
      description,
      attachmentUrls,
      isPin,
      isShow,
    });

    return Announcements.create(recode)
      .then(fp.get('id'))
      .then(getAnnouncement)
      .then(makeAnnouncement);
  }),
);

router.patch(
  '/:announcementId',
  response(async req => {
    await checkPermission(
      req,
      PERMISSION.BLOCK.ANNOUNCEMENT,
      PERMISSION.ACTION.UPDATE,
    );

    const announcementId = _.get(req, 'params.announcementId');
    const { title, description, attachmentUrls, isPin, isShow } = camelCaseKeys(
      req.body,
    );

    const recode = omitUndefined({
      title,
      description,
      attachmentUrls,
      isPin,
      isShow,
    });

    return Announcements.update(recode, {
      where: { id: announcementId },
      rejectOnEmpty: true,
    })
      .then(() => getAnnouncement(announcementId))
      .then(makeAnnouncement)
      .catch(error => {
        if (error instanceof Sequelize.EmptyResultError) {
          throw 404;
        }
        console.error(error);
        throw error;
      });
  }),
);

router.delete(
  '/:announcementId',
  response(async req => {
    await checkPermission(
      req,
      PERMISSION.BLOCK.ANNOUNCEMENT,
      PERMISSION.ACTION.DELETE,
    );

    const announcementId = _.get(req, 'params.announcementId');

    await Announcements.destroy({
      where: {
        id: announcementId,
      },
    });

    return null;
  }),
);

module.exports = router;
