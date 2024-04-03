import EventEmitter from 'node:events';

import type {
  AfterConversionToDocumentEventArgs,
  AfterConversionToEntityEventArgs,
  BeforeConversionToDocumentEventArgs,
  BeforeConversionToEntityEventArgs,
  BeforeRequestEventArgs,
  BulkInsertOperation,
  BulkInsertOptions,
  DatabaseSmuggler,
  DocumentSubscriptions,
  FailedRequestEventArgs,
  IAbstractIndexCreationTask,
  IDatabaseChanges,
  IDisposable,
  IDocumentSession,
  IDocumentStore,
  IHiLoIdGenerator,
  IStoreAuthOptions,
  MaintenanceOperationExecutor,
  OperationExecutor,
  SessionAfterSaveChangesEventArgs,
  SessionBeforeDeleteEventArgs,
  SessionBeforeQueryEventArgs,
  SessionBeforeStoreEventArgs,
  SessionCreatedEventArgs,
  SessionDisposingEventArgs,
  SessionOptions,
  SucceedRequestEventArgs,
  TimeSeriesOperations,
  TopologyUpdatedEventArgs,
} from 'ravendb';

import { DocumentConventions, DocumentSession, RequestExecutor } from 'ravendb';

export class CloudflareDocumentStore
  extends EventEmitter
  implements IDocumentStore
{
  identifier: string = 'store';

  // @ts-ignore
  authOptions: IStoreAuthOptions;
  // @ts-ignore
  hiLoIdGenerator: IHiLoIdGenerator;
  // @ts-ignore
  timeSeries: TimeSeriesOperations;

  conventions: DocumentConventions = new DocumentConventions();

  urls: string[];

  database: string;

  constructor(urls: string[], database: string) {
    super();

    this.database = database;
    this.urls = urls;
  }

  openSession(options: SessionOptions): IDocumentSession;
  openSession(database: string): IDocumentSession;
  openSession(): IDocumentSession;
  openSession(database?: unknown): IDocumentSession {
    const requestExecutor = this.getRequestExecutor(this.database);

    return new DocumentSession(this, 'test', {
      database: this.database,
      requestExecutor,
    });
  }

  changes(): IDatabaseChanges;
  changes(database: string): IDatabaseChanges;
  changes(database: string, nodeTag: string): IDatabaseChanges;
  changes(database?: unknown, nodeTag?: unknown): IDatabaseChanges {
    throw new Error('Method not implemented.');
  }

  initialize(): IDocumentStore {
    // do nothing
    return this;
  }

  executeIndex(task: IAbstractIndexCreationTask): Promise<void>;
  executeIndex(
    task: IAbstractIndexCreationTask,
    database: string,
  ): Promise<void>;
  executeIndex(task: unknown, database?: unknown): Promise<void> {
    return Promise.resolve();
  }

  executeIndexes(tasks: IAbstractIndexCreationTask[]): Promise<void>;
  executeIndexes(
    tasks: IAbstractIndexCreationTask[],
    database: string,
  ): Promise<void>;
  executeIndexes(tasks: unknown, database?: unknown): Promise<void> {
    return Promise.resolve();
  }

  bulkInsert(): BulkInsertOperation;
  bulkInsert(database: string): BulkInsertOperation;
  bulkInsert(database: string, options: BulkInsertOptions): BulkInsertOperation;
  bulkInsert(options: BulkInsertOptions): BulkInsertOperation;
  bulkInsert(
    database?: unknown,
    options?: unknown,
  ): import('ravendb').BulkInsertOperation {
    throw new Error('Method not implemented.');
  }

  get subscriptions(): DocumentSubscriptions {
    throw new Error('Method not implemented.');
  }

  getRequestExecutor(databaseName?: string | undefined): RequestExecutor {
    return RequestExecutor.create(this.urls, databaseName ?? this.database, {
      documentConventions: this.conventions,
    });
  }

  // @ts-ignore
  maintenance: MaintenanceOperationExecutor;
  // @ts-ignore
  operations: OperationExecutor;
  // @ts-ignore
  smuggler: DatabaseSmuggler;

  requestTimeout(timeoutInMs: number): IDisposable<void>;
  requestTimeout(timeoutInMs: number, database: string): IDisposable<void>;
  requestTimeout(
    timeoutInMs: unknown,
    database?: unknown,
  ): import('ravendb').IDisposable<void> {
    throw new Error('Method not implemented.');
  }

  addSessionListener(
    eventName: 'sessionDisposing',
    eventHandler: (args: SessionDisposingEventArgs) => void,
  ): this;
  addSessionListener(
    eventName: 'topologyUpdated',
    eventHandler: (args: TopologyUpdatedEventArgs) => void,
  ): this;
  addSessionListener(
    eventName: 'succeedRequest',
    eventHandler: (args: SucceedRequestEventArgs) => void,
  ): this;
  addSessionListener(
    eventName: 'beforeRequest',
    eventHandler: (args: BeforeRequestEventArgs) => void,
  ): this;
  addSessionListener(
    eventName: 'failedRequest',
    eventHandler: (args: FailedRequestEventArgs) => void,
  ): this;
  addSessionListener(
    eventName: 'beforeStore',
    eventHandler: (eventArgs: SessionBeforeStoreEventArgs) => void,
  ): this;
  addSessionListener(
    eventName: 'afterSaveChanges',
    eventHandler: (eventArgs: SessionAfterSaveChangesEventArgs) => void,
  ): this;
  addSessionListener(
    eventName: 'beforeQuery',
    eventHandler: (eventArgs: SessionBeforeQueryEventArgs) => void,
  ): this;
  addSessionListener(
    eventName: 'beforeDelete',
    eventHandler: (eventArgs: SessionBeforeDeleteEventArgs) => void,
  ): this;
  addSessionListener(
    eventName: 'beforeConversionToDocument',
    eventHandler: (eventArgs: BeforeConversionToDocumentEventArgs) => void,
  ): this;
  addSessionListener(
    eventName: 'afterConversionToDocument',
    eventHandler: (eventArgs: AfterConversionToDocumentEventArgs) => void,
  ): this;
  addSessionListener(
    eventName: 'beforeConversionToEntity',
    eventHandler: (eventArgs: BeforeConversionToEntityEventArgs) => void,
  ): this;
  addSessionListener(
    eventName: 'afterConversionToEntity',
    eventHandler: (eventArgs: AfterConversionToEntityEventArgs) => void,
  ): this;
  addSessionListener(eventName: unknown, eventHandler: unknown): this {
    // do nothing

    return this;
  }

  dispose(): void {
    // do nothing
  }

  removeSessionListener(
    eventName: 'failedRequest',
    eventHandler: (eventArgs: FailedRequestEventArgs) => void,
  ): void;
  removeSessionListener(
    eventName: 'beforeStore',
    eventHandler: (eventArgs: SessionBeforeStoreEventArgs) => void,
  ): void;
  removeSessionListener(
    eventName: 'afterSaveChanges',
    eventHandler: (eventArgs: SessionAfterSaveChangesEventArgs) => void,
  ): void;
  removeSessionListener(
    eventName: 'beforeQuery',
    eventHandler: (eventArgs: SessionBeforeQueryEventArgs) => void,
  ): void;
  removeSessionListener(
    eventName: 'beforeDelete',
    eventHandler: (eventArgs: SessionBeforeDeleteEventArgs) => void,
  ): void;
  removeSessionListener(
    eventName: 'beforeConversionToDocument',
    eventHandler: (eventArgs: BeforeConversionToDocumentEventArgs) => void,
  ): void;
  removeSessionListener(
    eventName: 'afterConversionToDocument',
    eventHandler: (eventArgs: AfterConversionToDocumentEventArgs) => void,
  ): void;
  removeSessionListener(
    eventName: 'beforeConversionToEntity',
    eventHandler: (eventArgs: BeforeConversionToEntityEventArgs) => void,
  ): void;
  removeSessionListener(
    eventName: 'afterConversionToEntity',
    eventHandler: (eventArgs: AfterConversionToEntityEventArgs) => void,
  ): void;
  removeSessionListener(eventName: unknown, eventHandler: unknown): void {
    // do nothing
  }

  removeListener(
    eventName: 'beforeRequest',
    eventHandler: (args: BeforeRequestEventArgs) => void,
  ): this;
  removeListener(
    eventName: 'succeedRequest',
    eventHandler: (args: SucceedRequestEventArgs) => void,
  ): this;
  removeListener(
    eventName: 'failedRequest',
    eventHandler: (args: FailedRequestEventArgs) => void,
  ): this;
  removeListener(
    eventName: 'sessionCreated',
    eventHandler: (args: SessionCreatedEventArgs) => void,
  ): void;
  removeListener(eventName: 'beforeDispose', eventHandler: () => void): void;
  removeListener(
    eventName: 'afterDispose',
    eventHandler: (callback: () => void) => void,
  ): void;
  removeListener(
    eventName: 'executorsDisposed',
    eventHandler: (callback: () => void) => void,
  ): void;
  removeListener(eventName: unknown, eventHandler: unknown): void | this {
    // do nothing
  }

  getLastTransactionIndex(database: string): number {
    return 0;
  }

  setLastTransactionIndex(database: string, index: number): void {
    // do nothing
  }

  registerEvents(executor: RequestExecutor): void {
    //   do nothing
  }

  getEffectiveDatabase(database: string): string {
    return database;
  }

  assertInitialized(): void {
    // do nothing
  }
}
