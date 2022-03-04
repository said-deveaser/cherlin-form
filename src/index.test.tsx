// import {ExampleComponent} from '.'
import {objectGet, objectSet} from './core/Helpers'

describe('testing functions objectGet/objectSet', () => {
  test('objectSet set name[1].folder value 123', () => {
    expect(
      objectSet({
        value: 123,
        path: 'name[1].test.folder[0].value[0]',
        obj: {},
      }).name[1].test.folder[0].value[0],
    ).toBe(123)
  })
  test('objectGet get name[1].folder and expect 123', () => {
    expect(
      objectGet({
        path: 'name[1].folder[0].value',
        obj: {
          name: [undefined, {folder: [{value: 123}]}],
        },
      }),
    ).toBe(123)
  })
})
