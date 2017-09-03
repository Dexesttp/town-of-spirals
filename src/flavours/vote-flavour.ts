export const voteFlavours: ((target: string, owner: string) => void)[] = [
(target, owner) =>  `
${target} has been chosen as the victim.
The town gather as ${target} is brought to the chair.
The chair begins its magic, and ${target} slowly feels their mind slipping away.
After a while, they stop struggling. They're let free to wander around, not able to think much anymore.
${owner} decides to take ${target} in and take care of them.
`,
];
