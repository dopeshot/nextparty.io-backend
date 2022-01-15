import slugify from 'slugify';

export const maxSlugLength = 50;

export function createSlug(string: string): string {
    const sluggedString = slugify(string, {
        remove: /[*+~.()\\/'"!:@]/g,
        lower: true
    });

    // Maximum length should be not too large and is thus stripped
    if (sluggedString.length > maxSlugLength) {
        const stringArr = sluggedString.slice(0, maxSlugLength).split('-');
        return stringArr.length > 1
            ? stringArr.slice(0, -1).join('-')
            : stringArr[0];
    }

    return sluggedString;
}
