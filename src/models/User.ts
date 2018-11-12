export class User {
  constructor(
    public connectivityElementSet: Array<Object>,
    public username: string,
    public password: string = "",
    public authKey: string = "",
    public displayName: string = "",
    public token: string = "",
  ) {}
}
