import * as admin from 'firebase-admin';

const serviceAccount = {
  type: 'service_account',
  project_id: 'book-29cab',
  private_key_id: '2d6b9ba3a2c1a1558e4e053f990232c6d3b1c0b9',
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDPHcyYmy/Tn+w9\nYkUshdb2RiV51WoIFIvmExpfF3hQIULlz5/cbwm/DXUePvNkAI+KsFcAIb5ftbBK\n4/2RjJoNA1nEqk8Sxi6Wh9zXJVx3WX4cdq7i1FAplZCHam4THCKb9DYi4Kdg0Hja\n6EklNU0+FwT1C3dmnTMagGlN+Fu0UpZA6IYiYgmQ9kGRWWEb9zc21ei9+fEeC1WP\n2m/l/u/IZf0lKqQMb5cGf8effufFqSmRoC9/0Ruo1dkwQnqw1YZWmcXKRJSQmfm+\nLjjgY26P9NWBxb9fOxVY/Rt0KpJCrA8jaiOzT7T5fJg976oHTugekR0qUXFZ04+g\nkrvkmPhFAgMBAAECggEABjLsoDao2EsljXLHAj2hQO65iWt3SHWg+EpjFCyGJ9PP\nBkTQEo9qOcMj2btlmn0fzrVXbUQVSBUOiTdIrBYKuE/83FOCmVvAIjY/yFqwaUwO\n57gvpM9Y9N2qnTr0v3KsoIFPK30Q1Wd37olcQxZU0QJsXg8xTCtxT54/SJuh1wRB\n9nPMY2XHmC255Da+N04S3qJa+EfYFVN0GFLKv32zhnPGy+YWXT6Evr5pmTQGKfyC\nxJOTDPS3zh8sWruP1/rby78QF2+JQwUdBsTaF7Is2r8rbIkQArSIrD6WSX450I46\nrOwh3JW/uG6AC8mpGt2VJAE4QIsMFfulbbYT6QsOQwKBgQD1JexVEi7Kh1JcIaLe\nTjHijdSUI6enDTVvLPNdzG5cyMmwuAP1vnKZtbnsx228qIlJMfZL5q4yBEpM2KE9\nENjlEkZSmmbCA6iulC1g5GdaYnCjLT+g6hylbrElbx5tvW8/g/gl6LuS7bTh2eZk\nJQO54XYSzODKEmE05wWF3/GSxwKBgQDYSOQyu/9vEle7riVChSsK1At/MoXsuiuo\nKTscgQCd8QTfKiXtwXEU523HlA3bkKufPJOOCxqXT3QwigS/Fnc1126Na48publ+\nVxx3Epf4ILkY2n8hbKE5+i9woCjhZn8EEasvGL26AQygOzlhe+HbOK+5zffIOsG3\nqxBcLWDQkwKBgQCWpEclv5ahPaaOltzOXp6o6R7IKWDMdoFvX9/ss8LdoUTPI0TL\nrcweSF2H8sSsOaSjJeCDo61Hbvt5XWU3cTLXEPPFrruWXUk6fjOkZrZcBEHTA+sl\nprcTsYGJz06TgOTr0tyZ7vnUv913K783qscvYix8QQmhIso5B/2M1qBL4QKBgCyl\n933Fs3hhZ/0VeRmfVgBZP7pVWrJAyGxhfpNmyhLQw3myQLwxF8AB+nadyLKPze4E\nWk2TWzzrKQgwJcSwxZE21Nqa3qX1ciZzoyutifOuBafsyxvCShIm5I4ycd3+A7B6\nWUVSrS/tsYaOU00dfsV7kUMhEsqh3oWk6a6tq3PDAoGBANd9LImAj36sPjgs76Tj\nZIg9mvMbh6lrOc/u/JGU2a63HGmu14/L4NS1BZa/7fO1fa5B4TyVpylmd8NSomnz\neUTGr+nQUxeie8dj2BPG+ptwPLbgQ+829BqpB8cjjnE4QJt69LLvu0itjXyCHwfT\nMyId9BHqexLe0ZK5B/bvWlks\n-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-ol1dg@book-29cab.iam.gserviceaccount.com',
  client_id: '100143844753360718137',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ol1dg%40book-29cab.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com',
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: 'book-29cab.appspot.com',
});

export const firebaseStorage = admin.storage().bucket();
