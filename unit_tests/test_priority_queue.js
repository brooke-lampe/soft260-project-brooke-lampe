QUnit.module('priority_queue.js');
/* globals QUnit PriorityQueue */
/* eslint-disable no-magic-numbers, no-underscore-dangle */

/*  Method

      Categories (same categories _getNextIndex, peek, dequeue)
        Number of elements
          No element in queue
          One element in queue
          More than one element in queue
        Priorities
          Same priorities for multiple elements in queue
          Different for all elements in queue

      Categories (enqueue)
        Existence
          Element to be added exists in queue
          Element to be added does not exist in queue
        Priorities
          Element to be added has same priority as an element in queue
          Element to be added does not have same priority as an element in queue

      Categories (enqueue)
        Existence
          Element to be deleted exists in queue
          Element to be deleted does not exist in queue

*/

function metric(element) {
  let value = undefined;

  if (element < 0) {
    value = -1;
  } else if (element === 0) {
    value = 0;
  } else if (element < 2) {
    value = 1;
  } else if (element < 10) {
    value = 2;
  } else if (element < 20) {
    value = 3;
  } else {
    value = 4;
  }

  return value;
}

QUnit.test('Get the next index of a queue with no element', (assert) => {
  const pQueue = new PriorityQueue(metric, []);
  const next = pQueue._getNextIndex();
  assert.deepEqual(next, undefined);
});

QUnit.test('Get the next index of a queue with one element', (assert) => {
  const pQueue = new PriorityQueue(metric, [5]);
  const next = pQueue._getNextIndex();
  assert.deepEqual(next, '5');
});
