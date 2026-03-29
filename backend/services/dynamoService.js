const AWS = require('aws-sdk');
const { createSlug } = require('../utils/slug');

class DynamoService {
  constructor() {
    this.dynamoDB = new AWS.DynamoDB.DocumentClient({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    this.tableName = 'health_media_articles';
  }

  async createArticle(title, content) {
    const slug = createSlug(title);
    const timestamp = new Date().toISOString();

    const params = {
      TableName: this.tableName,
      Item: {
        slug: slug,
        title: title,
        content: content,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      ConditionExpression: 'attribute_not_exists(slug)'
    };

    try {
      await this.dynamoDB.put(params).promise();
      return { slug, title, content, createdAt: timestamp, updatedAt: timestamp };
    } catch (error) {
      if (error.code === 'ConditionalCheckFailedException') {
        throw new Error('An article with this title already exists');
      }
      throw error;
    }
  }

  async getAllArticles() {
    const params = {
      TableName: this.tableName,
      ProjectionExpression: 'slug, title, createdAt, updatedAt'
    };

    try {
      const result = await this.dynamoDB.scan(params).promise();
      return result.Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      throw error;
    }
  }

  async getArticleBySlug(slug) {
    const params = {
      TableName: this.tableName,
      Key: { slug }
    };

    try {
      const result = await this.dynamoDB.get(params).promise();
      return result.Item || null;
    } catch (error) {
      throw error;
    }
  }

  async updateArticle(slug, title, content) {
    const timestamp = new Date().toISOString();
    const newSlug = createSlug(title);

    // If title changed and slug is different, we need to create new and delete old
    if (slug !== newSlug) {
      // Create new article
      const newArticle = await this.createArticle(title, content);
      
      // Delete old article
      await this.deleteArticle(slug);
      
      return newArticle;
    }

    const params = {
      TableName: this.tableName,
      Key: { slug },
      UpdateExpression: 'SET title = :title, content = :content, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':title': title,
        ':content': content,
        ':updatedAt': timestamp
      },
      ConditionExpression: 'attribute_exists(slug)',
      ReturnValues: 'ALL_NEW'
    };

    try {
      const result = await this.dynamoDB.update(params).promise();
      return result.Attributes;
    } catch (error) {
      if (error.code === 'ConditionalCheckFailedException') {
        throw new Error('Article not found');
      }
      throw error;
    }
  }

  async deleteArticle(slug) {
    const params = {
      TableName: this.tableName,
      Key: { slug },
      ConditionExpression: 'attribute_exists(slug)'
    };

    try {
      await this.dynamoDB.delete(params).promise();
      return { success: true };
    } catch (error) {
      if (error.code === 'ConditionalCheckFailedException') {
        throw new Error('Article not found');
      }
      throw error;
    }
  }
}

module.exports = new DynamoService();