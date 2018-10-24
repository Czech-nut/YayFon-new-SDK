export class User {
  constructor(
    public username: string,
    public password: string,
    public authKey: string,
    public displayName: string,
    public token: string,
    public connectivityElementSet: Array<Object>
  ) {}
}
