
const modules = import.meta.glob('./*.js', { eager: true });

const scenes = {};

for (const path in modules) {
  const name = path.match(/\.\/(.*)Scene\.js$/)?.[1];
  if (name) {
    scenes[name] = modules[path].default;
  }
}

export default scenes;