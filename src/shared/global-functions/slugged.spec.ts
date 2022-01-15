import { getString } from './get-string';
import { createSlug, maxSlugLength } from './slugged';

describe('Slugify tests', () => {
    it('Slugify to lower', () => {
        expect(createSlug('Jibba')).toBe('jibba');
        expect(createSlug('JIBBA')).toBe('jibba');
    });

    it('Slugify remove symbols', () => {
        expect(createSlug('*+~.()/\'"!:@')).toBe('');
    });

    it('Slugify max length: no space', () => {
        expect(createSlug(getString(maxSlugLength)).length).toBe(maxSlugLength);
    });

    it('Slugify max length: with space', () => {
        expect(
            createSlug(
                'I AM a very long text that is not way too long to be allowed to slug entirely'
            )
        ).toBe('i-am-a-very-long-text-that-is-not-way-too-long-to');
    });
});
