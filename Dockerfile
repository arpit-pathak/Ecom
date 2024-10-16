FROM public.ecr.aws/bitnami/node:14.17.3

WORKDIR /usr/src/frontend/
ENV PATH /usr/src/frontend/node_modules/.bin:$PATH

ARG REACT_APP_ENVIRONMENT
ENV REACT_APP_ENVIRONMENT=$REACT_APP_ENVIRONMENT

COPY ckeditor5/package.json ./ckeditor5/
COPY *.json ./
RUN npm install -p

COPY . ./
RUN npm run build

EXPOSE 80