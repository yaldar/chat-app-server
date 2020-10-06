type UserType = {
  nickname: string;
  id: string;
};
const getNickname = (id: string, users: UserType[]) => {
  const found = users.find((u) => u.id === id);
  if (found) {
    return found.nickname;
  }
  return null;
};

const getTime = () => {
  const today = new Date();
  const date = `${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}-${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;
  return date;
};

const existHandler = (
  code: string,
  logger: any,
  io: SocketIO.Server,
) => {
  logger.info(`Shutting down on ${code}`);
  io.emit('server_shutdown');
  io.close();
};

module.exports = {
  getNickname,
  getTime,
  existHandler,
};
export default { getNickname, getTime, existHandler };
