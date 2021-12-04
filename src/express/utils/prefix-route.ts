export default (route: string, prefix?: string): string => {
  if (!prefix) {
    return route;
  }

  return prefix.concat(route).replaceAll('//', '/');
};
