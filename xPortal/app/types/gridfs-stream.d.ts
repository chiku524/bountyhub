declare module 'gridfs-stream' {
  import { Db } from 'mongodb';
  import { Readable, Writable } from 'stream';

  namespace Grid {
    interface Grid {
      files: {
        findOne(query: any): Promise<any>;
        find(query: any): Promise<any[]>;
      };
      createReadStream(options: any): Readable;
      createWriteStream(options: any): Writable;
      collection(name: string): void;
      mongo: {
        ObjectId: any;
      };
    }
  }

  function Grid(db: Db, mongo: any): Grid.Grid;
  export = Grid;
} 