import slugify from 'slugify';
const maxSlugLength = 50;
export function slugged(string: string): string {
    // Maximum length should be not too large and is thus stripped
    if (string.length > maxSlugLength) {
        const stringArr = string.slice(0, maxSlugLength).split(' ');
        return stringArr.length > 1
            ? slugify(stringArr.slice(0, -1).join())
            : slugify(stringArr[0]);
    }

    return slugify(string, {
        remove: /[*+~.()/'"!:@]/g,
        lower: true
    });
}
