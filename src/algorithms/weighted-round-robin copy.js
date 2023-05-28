'use strict';

class Peer {
    constructor(weight) {
    this.id = uniqueId();
    this.weight = weight || 10;
    this.currentWeight = this.weight;
    this.effectiveWeight = this.weight;
    }
}

function uniqueId() {
    return 'peer_' + (_uniqueId++);
}

class WRR {
    constructor() {
        this._peerMap = new Map();
        this._length = 0;
    }

    size() {
        return this._length;
    }

    add(peer) {
        if (!peer) return false;
        const key = "id" in peer ? peer.id : (peer.id = uniqueId());
        if (!this._peerMap.has(key)) this._length++;
        this._peerMap.set(key, this._reset(peer));
        return key;
    }

    remove(key) {
        if (typeof key === 'function') {
        this._peerMap.forEach((peer, peerKey) => {
            if (key(peer)) this.remove(peerKey);
        });
        return;
    }

        if (this._peerMap.has(key)) {
            this._peerMap.delete(key);
            this._length--;
        }
    }

    each(fn, context) {
        this._peerMap.forEach(fn, context);
    }

    reset() {
        this._peerMap.forEach(peer => {
            this._reset(peer);
        });
    }

    _reset(peer) {
        if (Array.isArray(peer)) {
            peer.forEach(this._reset, this);
        return;
    }
    peer.weight = peer.weight || 10;
    peer.currentWeight = peer.weight;
    peer.effectiveWeight = peer.weight;
    return peer;
}

    get() {
        let bestPeer = null;
        let totalEffectiveWeight = 0;
        if (this._length === 0) return null;

        if (this._length === 1) {
            for (const [key, peer] of this._peerMap) {
                return peer;
            }
        }

        for (const [key, peer] of this._peerMap) {
            totalEffectiveWeight += peer.effectiveWeight;
            peer.currentWeight += peer.effectiveWeight;

            if (peer.effectiveWeight < peer.weight) peer.effectiveWeight++;

            if (!bestPeer || bestPeer.currentWeight < peer.currentWeight) {
                bestPeer = peer;
            }
        }

    if (bestPeer) {
        bestPeer.currentWeight -= totalEffectiveWeight;
    }

    return bestPeer;
    }
}

module.exports = WRR;
