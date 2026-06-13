type BodyType = {
  message: {
    data: string;
    messageId: string;
    message_id: string;
    publishTime: string;
    publish_time: string;
  };
  subscription: string;
};

export interface SSEType {
  plugin: string;
  body: BodyType | unknown;
}
