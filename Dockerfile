FROM node:10.16.3-jessie-slim

ARG REACT_PATH
COPY . ${REACT_PATH}
WORKDIR ${REACT_PATH}

EXPOSE 19000
EXPOSE 19001

RUN npm install expo-cli --global && npm install

ENTRYPOINT [ "npm" ]
CMD [ "start" ]