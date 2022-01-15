import { getString } from './get-string';
import { maxSlugLength, slugged } from './slugged';

describe('Slugify tests', () => {
    it('Slugify to lower', () => {
        expect(slugged('Jibba')).toBe('jibba');
        expect(slugged('JIBBA')).toBe('jibba');
    });

    it('Slugify remove symbols', () => {
        expect(slugged('*+~.()/\'"!:@')).toBe('');
    });

    it('Slugify max length: no space', () => {
        expect(slugged(getString(maxSlugLength)).length).toBe(maxSlugLength);
    });

    it('Slugify max length: with space', () => {
        expect(
            slugged(
                'I AM a very long text that is not way too long to be allowed to slug entirely'
            )
        ).toBe('i-am-a-very-long-text-that-is-not-way-too-long-to');
    });
});
