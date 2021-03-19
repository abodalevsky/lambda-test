'use strict';

module.exports.add = async (event, context, callback) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'ToDo added',
        input: event,
      },
      null,
      2
    ),
  };
};

module.exports.update = async (event, context, callback) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'ToDo updated',
        input: event,
      },
      null,
      2
    ),
  };
};

module.exports.delete = async (event, context, callback) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'ToDo deleted',
        input: event,
      },
      null,
      2
    ),
  };
};

module.exports.get = async (event, context, callback) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'ToDo gotten',
        input: event,
      },
      null,
      2
    ),
  };
};

module.exports.list = async (event, context, callback) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'ToDo\'s listed',
        input: event,
      },
      null,
      2
    ),
  };
};



