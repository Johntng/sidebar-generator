import arg from 'arg';
import fs from 'fs';
import readdirp from 'readdirp';

const _sidebarFile = '_sidebar.md';
const filterFiles = ['*.md','!README.md', '!_sidebar.md'];

let generator_options = {};

function parseArgumentsIntoOptions(rawArgs) {
    const args = arg(
        {
            '--help': Boolean,
            '--depth': Number,
            '--sort': Boolean,
            '--default': Boolean,
            '-h': '--help',
            '-d': '--depth',
            '-s': '--sort',
        },
        {
            argv: rawArgs.slice(2)
        }
    );
    return {
        help: args['--help'] || false,
        depth: args['--depth'] || 5,
        sort: args['--sort'] || false,
        default: args['--default'] || false
    };
}

async function parseDirectoriesForMDFiles() {

    const files = await readdirp.promise(
        './', {
            fileFilter: filterFiles,
            directoryFilter: '*',
            type: 'files',
            depth: generator_options.depth
        });

    return files;
}

function sortMDFiles(MDfiles) {

    MDfiles.sort((a,b) => {

        if (a.path < b.path)
            return -1;
        if (a.path > b.path)
            return 1;
        return 0;
    });

    return MDfiles;
}

function generateSidebarFile(MDfiles) {

    let content = `<!-- docs/_sidebar.md -->\n\n`;

    // Assume README.md exist.
    content += `* [Home](/)\n`;

    // Iterate the rest of the files.
    MDfiles.forEach(entity => {
        content += `* [` + entity.basename + `](` + entity.path.replace(/ /g, '%20') + `)\n`;
    });

    try {
        var data = fs.readFileSync(...)
    } catch (err) {
        // If the type is not what you want, then just throw the error again.
        if (err.code !== 'ENOENT') throw err;

        // Handle a file-not-found error
    }

    fs.writeFile(_sidebarFile, content, 'utf8', (err) => { if (err) { return err; }});

    console.log('\nGenerated ' + _sidebarFile + 'successfully.\n');
}

function displayHelp() {

    console.log(
        `\nOptions: \n\n` +
        `Default options:\n` +
        `depth is 5\n` +
        `sort is not on by default\n` +
        `\n` +
        `--help, -h \t\t Display help.\n` +
        `--default \t\t Shows default options.\n` +
        `--depth, -d [Number] \t Set the depth of the directory to recursive to find *.md files.\n` +
        `--sort, -s \t\t Option to sort the the *.md files in alphabetical order.` +
        `\n`
    );
}

export async function cli(args) {

    generator_options = parseArgumentsIntoOptions(args);
    // console.log(generator_options);

    if(generator_options.help === true) {

        displayHelp();

        // Early out return.
        return;
    }

    // Step 1: Parse the *.md files.
    let MDfiles = await parseDirectoriesForMDFiles();
    //console.log(MDfiles);

    // Step 2: Sort the files if required.
    // Sort is done based on directories, then file names.
    if(generator_options.sort === true) {
        MDfiles = sortMDFiles(MDfiles);
    }

    // Step 3: Generate the _sidebar.md file.
    generateSidebarFile(MDfiles);
}