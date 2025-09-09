import { BaseCache } from '@services/redis/base.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import Logger from 'bunyan';
import { config } from '@root/config';
import { ServerError } from '@globals/helpers/error-handlers';

const log: Logger = config.createLogger('UserCache');


export class UserCache extends BaseCache{
  constructor(){
    super('userCache');
  }
  public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    const createdAt = new Date();
    const {
      id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = createdUser;
    const firstList: string[] = [
      '_id', `${id}`,
      'uid', `${uId}`,
      'username', `${username}`,
      'email', `${email}`,
      'avatarColor', `${avatarColor}`,
      'createdAt', `${createdAt}`,
      'postCount', `${postsCount}`
    ];
    const secondList: string[] = [
      'blocked', JSON.stringify(blocked),
      'blockedBy', JSON.stringify(blockedBy),
      'profilePicture', `${profilePicture}`,
      'followersCount', `${followersCount}`,
      'followingCount', `${followingCount}`,
      'notifications', JSON.stringify(notifications),
      'social', JSON.stringify(social)
    ];
    const thirdList: string[] = [
      'work', `${work}`,
      'school', `${school}`,
      'location', `${location}`,
      'quote', `${quote}`,
      'bgImageId', `${bgImageId}`,
      'bgImageVersion', `${bgImageVersion}`
    ];
    const dataToSave: string = [...firstList, ...secondList, ...thirdList];

    try {
      if(!this.client.isOpen){
        await this.client.connect();
      }
      await this.client.ZADD('user', {score: parseInt(userUId, 10), value: `${key}`});
      await this.client.HSET(`users:${key}`, dataToSave);
    } catch (error) {
      log.error();
      throw new ServerError('Server Error, Try Again!');
    }
  }
}
