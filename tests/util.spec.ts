import { json } from 'body-parser';
import fs from 'fs';
import Socket from 'socket.io';
import { logger } from '../logger';
import util from '../util';
import express from 'express';
import http from 'http';

const firstUser =
  {
    nickname: 'John Doe',
    id: '123123123',
  }
;

const secondUser = {
  nickname: 'second user',
  id: '222222222',
};

beforeAll(() => {
  util.initDataBase();
});

describe('database operations', () => {
  it('initialize database with an empty array', () => {
    expect(util.getAllData()).toStrictEqual([]);
  });

  it('should add new user successfully', () => {
    util.addUser(firstUser.nickname, firstUser.id);

    const expectedOutput = [firstUser];
    const result = util.getAllData();
    expect(result.length).toBe(1);
    expect(result).toStrictEqual(expectedOutput);
  });

  it('should add another user successfully', () => {
    util.addUser(secondUser.nickname, secondUser.id);
    const expectedOutput = [firstUser, secondUser];
    const result = util.getAllData();
    expect(result.length).toBe(2);
    expect(result).toStrictEqual(expectedOutput);
  });


  it('should get all nicknames successfully', () => {
    const expectedOutput = ['John Doe', 'second user'];
    const result = util.getNicknames();
    expect(result.length).toBe(2);
    expect(result).toStrictEqual(expectedOutput);
  });

  it('should remove the new users', () => {
    const oneNicknameArray = ['John Doe'];
    util.removeUser(secondUser.nickname);
    expect(util.getAllData().length).toBe(1);
    expect(util.getNicknames().length).toBe(1);
    expect(util.getAllData()).toStrictEqual([firstUser]);
    expect(util.getNicknames()).toStrictEqual(oneNicknameArray);
  });
  it('return correct nickname of an existing user', () => {
    const expectedOutput = 'John Doe';

    expect(util.getNickname('123123123')).toBe(expectedOutput);
  });

  it('return null instead of nickname if no user is not in database', () => {
    expect(util.getNickname('0000000000')).toBeNull();
  });

  it('should return true when quering for existing user', () => {
    expect(util.alreadyExists('John Doe')).toBeTruthy();
  });

  it('should return false when quering for non-existing user', () => {
    expect(util.alreadyExists('non-existing user')).toBeFalsy();
  });
});
describe('shutting down behaviour when terminating server', () => {
  const code = 'SIGINT';
  const clearLog = () => {
    fs.writeFileSync('./combined.log', '');
  };
  const app = express();
  const server = http.createServer(app);
  const io = Socket(server);

  clearLog();
  util.existHandler(code, logger, io);

  const readLog = () => {
    console.log('herereererereer', fs.readFileSync('./combined.log', 'utf-8'));
    return fs.readFileSync('./combined.log', 'utf-8');
  };
  it('should log server termination in correct format', () => {
    expect(readLog()).toBe(`Shutting down on ${code}`);

    // logger.info(`Shutting down on ${code}`);
    // io.emit('server_shutdown');
    // io.close();
  });
});
