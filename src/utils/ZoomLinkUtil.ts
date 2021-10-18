export default class ZoomLink {
  /**
   * desktop link
   *
   * @static
   * @param {string} roomId [ルームID]
   * @param {string} password　　[パスワード]
   * @return {string} [Desktop Zoom Link]
   * @memberof ZoomLink
   */
  public static DesktopLink(roomId: string, password: string): string {
    return `zoommtg://zoom.us/join?confno=${roomId}&pwd=${password}`;
  }

  /**
   * mobile link
   *
   * @static
   * @param {string} roomId [ルームID]
   * @param {string} password [パスワード]
   * @return {string} [Mobile Zoom Link]
   * @memberof ZoomLink
   */
  public static MobileLink(roomId: string, password: string): string {
    return `zoomus://zoom.us/join?confno=${roomId}&pwd=${password}`;
  }
}
