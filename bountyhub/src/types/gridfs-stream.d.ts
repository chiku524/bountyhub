declare module 'gridfs-stream' {
  import { Db, ObjectId } from 'mongodb';
  import { Readable, Writable } from 'stream';

  namespace Grid {
    interface Grid {
      files: {
        findOne(query: Record<string, unknown>): Promise<unknown>;
        find(query: Record<string, unknown>): Promise<unknown[]>;
      };
      createReadStream(options: Record<string, unknown>): Readable;
      createWriteStream(options: Record<string, unknown>): Writable;
      collection(name: string): void;
      mongo: {
        ObjectId: typeof ObjectId;
      };
    }
  }

  function Grid(db: Db, mongo: { ObjectId: typeof ObjectId }): Grid.Grid;
  export = Grid;
} 