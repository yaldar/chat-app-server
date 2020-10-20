import { Server } from 'socket.io';
import { readFileSync, writeFileSync } from 'fs';

interface UserType {
  nickname: string;
  id: string;
}

const getAllData = () => {
  const data = readFileSync('./users.json', { encoding: 'utf-8' });
  const users: UserType[] = JSON.parse(data);
  return users;
};

const getNicknames = () => {
  const users = getAllData();
  return users.map((el) => el.nickname);
};
const getNickname = (id: string) => {
  const users = getAllData();
  const found = users.find((u) => u.id === id);
  if (found) {
    return found.nickname;
  }
  return null;
};

const writeToFile = (path: string, data: string) => {
  writeFileSync(path, data);
};
const addUser = (nickname, id) => {
  const user = { nickname, id };

  const users = getAllData();
  users.push(user);

  writeToFile('./users.json', JSON.stringify(users));
};

const getTime = () => {
  const today = new Date();
  const date = `${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}-${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;
  return date;
};

const removeUser = (nickname: string) => {
  const allUsers = getAllData();
  const newUsers = allUsers.filter((el) => el.nickname !== nickname);
  writeFileSync('./users.json', JSON.stringify(newUsers));
};

const alreadyExists = (nickname: string) => getNicknames().some((el) => el === nickname);

const initDataBase = () => {
  const data = readFileSync('./users.json', 'utf-8');
  if (data) {
    try {
      // use joi here
    } catch (_e) {
      // log error in json format
      writeFileSync('./users.json', JSON.stringify([]));
    }
  } else {
    writeFileSync('./users.json', JSON.stringify([]));
  }
};
const existHandler = (code: string, logger: any, io: Server) => {
  logger.info(`Shutting down on ${code}`);
  io.emit('server_shutdown');
  io.close();
};

export default {
  getNickname,
  getTime,
  existHandler,
  removeUser,
  getNicknames,
  addUser,
  alreadyExists,
  getAllData,
  initDataBase,
};
