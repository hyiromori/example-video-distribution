const AWS = require('aws-sdk')
const { v4: uuid } = require('uuid')
const { logger } = require('../lib/logger')
const { putVideoInfo } = require('../lib/dynamodb')

const S3 = new AWS.S3({ apiVersion: '2006-03-01' })
const Bucket = process.env.S3_BUCKET

module.exports.handler = async (event) => {
  try {
    const id = uuid()
    const path = `_source/${id}`
    const { contentType } = event.queryStringParameters

    const params = {
      Bucket,
      Key: path,
      ContentType: contentType,
      Expires: 3600, // 1 Hour
    }
    const uploadUrl = await S3.getSignedUrlPromise('putObject', params)
    await putVideoInfo(id, {})

    return {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, uploadUrl }, null, 2),
    }
  } catch (err) {
    logger.error(err)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: err.message,
      }, null, 2),
    }
  }
}
