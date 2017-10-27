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

      Categories (delete)
        Existence
          Element to be deleted exists in queue
          Element to be deleted does not exist in queue

*/

function metric(element) {
  let value = undefined;

  if (element < 0) {
    value = 6;
  } else if (element === 0) {
    value = 5;
  } else if (element < 2) {
    value = 4;
  } else if (element < 10) {
    value = 3;
  } else if (element < 20) {
    value = 2;
  } else {
    value = 1;
  }

  return value;
}

QUnit.test('Get the next index of a queue with no element', (assert) => {
  const pQueue = new PriorityQueue();
  const next = pQueue._getNextIndex();
  assert.deepEqual(next, undefined);
});

QUnit.test('Get the next index of a queue with one element', (assert) => {
  const pQueue = new PriorityQueue();
  pQueue.enqueue('5');
  const next = pQueue._getNextIndex();
  assert.deepEqual(next, 0);
});

QUnit.test('Get the next index of a queue with more than one element', (assert) => {
  const pQueue = new PriorityQueue();
  pQueue.enqueue('5');
  pQueue.enqueue('4');
  pQueue.enqueue('3');
  pQueue.enqueue('6');
  const next = pQueue._getNextIndex();
  assert.deepEqual(next, 2);
});

QUnit.test('Get the next index of a queue with non-unique priorities', (assert) => {
  const pQueue = new PriorityQueue();
  pQueue.enqueue('5');
  pQueue.enqueue('3');
  pQueue.enqueue('3');
  pQueue.enqueue('6');
  const next = pQueue._getNextIndex();
  assert.deepEqual(next, 1);
});

QUnit.test('Get the next index of a queue with all non-unique priorities', (assert) => {
  const pQueue = new PriorityQueue();
  pQueue.enqueue('5');
  pQueue.enqueue('5');
  pQueue.enqueue('5');
  pQueue.enqueue('5');
  const next = pQueue._getNextIndex();
  assert.deepEqual(next, 0);
});

QUnit.test('Get the next index of a queue while exercising the metric parameter', (assert) => {
  const pQueue = new PriorityQueue(metric);
  pQueue.enqueue('2');
  pQueue.enqueue('0');
  pQueue.enqueue('4');
  pQueue.enqueue('40');
  const next = pQueue._getNextIndex();
  assert.deepEqual(next, 3);
});

QUnit.test('Use peek with no element', (assert) => {
  const pQueue = new PriorityQueue();
  const rQueue = new PriorityQueue();
  const next = pQueue.peek();
  assert.deepEqual(pQueue._getNextIndex(), rQueue._getNextIndex());
  assert.deepEqual(next, undefined);
});

QUnit.test('Use peek with one element', (assert) => {
  const pQueue = new PriorityQueue();
  const rQueue = new PriorityQueue();
  pQueue.enqueue('5');
  rQueue.enqueue('5');
  const next = pQueue.peek();
  assert.deepEqual(pQueue._getNextIndex(), rQueue._getNextIndex());
  assert.deepEqual(next, '5');
});

QUnit.test('Use peek with more than one element', (assert) => {
  const pQueue = new PriorityQueue();
  const rQueue = new PriorityQueue();
  pQueue.enqueue('5');
  pQueue.enqueue('4');
  pQueue.enqueue('3');
  pQueue.enqueue('6');
  rQueue.enqueue('5');
  rQueue.enqueue('4');
  rQueue.enqueue('3');
  rQueue.enqueue('6');
  const next = pQueue.peek();
  assert.deepEqual(pQueue._getNextIndex(), rQueue._getNextIndex());
  assert.deepEqual(next, '3');
});

QUnit.test('Use peek with non-unique priorities', (assert) => {
  const pQueue = new PriorityQueue();
  const rQueue = new PriorityQueue();
  pQueue.enqueue('5');
  pQueue.enqueue('3');
  pQueue.enqueue('3');
  pQueue.enqueue('6');
  rQueue.enqueue('5');
  rQueue.enqueue('3');
  rQueue.enqueue('3');
  rQueue.enqueue('6');
  const next = pQueue.peek();
  assert.deepEqual(pQueue._getNextIndex(), rQueue._getNextIndex());
  assert.deepEqual(next, '3');
});

QUnit.test('Use peek with all non-unique priorities', (assert) => {
  const pQueue = new PriorityQueue();
  const rQueue = new PriorityQueue();
  pQueue.enqueue('5');
  pQueue.enqueue('5');
  pQueue.enqueue('5');
  pQueue.enqueue('5');
  rQueue.enqueue('5');
  rQueue.enqueue('5');
  rQueue.enqueue('5');
  rQueue.enqueue('5');
  const next = pQueue.peek();
  assert.deepEqual(pQueue._getNextIndex(), rQueue._getNextIndex());
  assert.deepEqual(next, '5');
});

QUnit.test('Use peek while exercising the metric parameter', (assert) => {
  const pQueue = new PriorityQueue(metric);
  const rQueue = new PriorityQueue(metric);
  pQueue.enqueue('2');
  pQueue.enqueue('0');
  pQueue.enqueue('4');
  pQueue.enqueue('40');
  rQueue.enqueue('2');
  rQueue.enqueue('0');
  rQueue.enqueue('4');
  rQueue.enqueue('40');
  const next = pQueue.peek();
  assert.deepEqual(pQueue._getNextIndex(), rQueue._getNextIndex());
  assert.deepEqual(next, '40');
});

QUnit.test('Dequeue an element with no element', (assert) => {
  const pQueue = new PriorityQueue();
  const next = pQueue.dequeue();
  assert.deepEqual(next, undefined);
});

QUnit.test('Dequeue an element with one element', (assert) => {
  const pQueue = new PriorityQueue();
  const rQueue = new PriorityQueue();
  pQueue.enqueue('5');
  rQueue.enqueue('5');
  const next = pQueue.dequeue();
  assert.notDeepEqual(pQueue.peek(), rQueue.peek());
  assert.deepEqual(next, '5');
});

QUnit.test('Dequeue an element with more than one element', (assert) => {
  const pQueue = new PriorityQueue();
  const rQueue = new PriorityQueue();
  pQueue.enqueue('5');
  pQueue.enqueue('4');
  pQueue.enqueue('3');
  pQueue.enqueue('6');
  rQueue.enqueue('5');
  rQueue.enqueue('4');
  rQueue.enqueue('3');
  rQueue.enqueue('6');
  const next = pQueue.dequeue();
  assert.notDeepEqual(pQueue.peek(), rQueue.peek());
  assert.deepEqual(next, '3');
});

QUnit.test('Dequeue an element with non-unique priorities', (assert) => {
  const pQueue = new PriorityQueue();
  pQueue.enqueue('5');
  pQueue.enqueue('3');
  pQueue.enqueue('3');
  pQueue.enqueue('6');
  const next = pQueue.dequeue();
  assert.deepEqual(next, '3');
});

QUnit.test('Dequeue an element with all non-unique priorities', (assert) => {
  const pQueue = new PriorityQueue();
  pQueue.enqueue('5');
  pQueue.enqueue('5');
  pQueue.enqueue('5');
  pQueue.enqueue('5');
  const next = pQueue.dequeue();
  assert.deepEqual(next, '5');
});

QUnit.test('Dequeue an element while exercising the metric parameter', (assert) => {
  const pQueue = new PriorityQueue(metric);
  const rQueue = new PriorityQueue(metric);
  pQueue.enqueue('2');
  pQueue.enqueue('0');
  pQueue.enqueue('4');
  pQueue.enqueue('40');
  rQueue.enqueue('2');
  rQueue.enqueue('0');
  rQueue.enqueue('4');
  rQueue.enqueue('40');
  const next = pQueue.dequeue();
  assert.notDeepEqual(pQueue.peek(), rQueue.peek());
  assert.deepEqual(next, '40');
});

QUnit.test('Enqueue an element that exists in queue', (assert) => {
  const pQueue = new PriorityQueue();
  pQueue.enqueue('5');
  pQueue.enqueue('5');
  const next = pQueue.dequeue();
  const next2 = pQueue.dequeue();
  assert.deepEqual(next, '5');
  assert.deepEqual(next2, '5');
});

QUnit.test('Enqueue an element that does not exist in queue', (assert) => {
  const pQueue = new PriorityQueue();
  pQueue.enqueue('2');
  pQueue.enqueue('5');
  const next = pQueue.dequeue();
  const next2 = pQueue.dequeue();
  assert.deepEqual(next, '2');
  assert.deepEqual(next2, '5');
});

QUnit.test('Delete an element that exists in queue', (assert) => {
  const pQueue = new PriorityQueue();
  pQueue.enqueue('5');
  pQueue.enqueue('7');
  pQueue.delete('5');
  const next = pQueue.dequeue();
  const next2 = pQueue.dequeue();
  assert.deepEqual(next, '7');
  assert.deepEqual(next2, undefined);
});

QUnit.test('Delete an element that does not exist in queue', (assert) => {
  const pQueue = new PriorityQueue();
  pQueue.enqueue('7');
  pQueue.enqueue('7');
  pQueue.delete('5');
  const next = pQueue.dequeue();
  const next2 = pQueue.dequeue();
  const next3 = pQueue.dequeue();
  assert.deepEqual(next, '7');
  assert.deepEqual(next2, '7');
  assert.deepEqual(next3, undefined);
});
