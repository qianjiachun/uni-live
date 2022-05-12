class STT {
    escape(v) {
        return v.toString().replace(/@/g, '@A').replace(/\//g, '@S')
    }

    unescape(v) {
        if (!v) return
        return v.toString().replace(/@A/g, '@').replace(/@S/g, '/')
    }

    // serialize(raw) {
    //     if (util.isObject(raw)) {
    //         return Object.keys(raw).map(k => `${k}@=${this.escape(this.serialize(raw[k]))}/`).join('')
    //     } else if (Array.isArray(raw)) {
    //         return raw.map(v => `${this.escape(this.serialize(v))}/`).join('')
    //     } else if (util.isString(raw) || util.isNumber(raw)) {
    //         return raw.toString()
    //     }
    // }

    deserialize(raw) {
        if(!raw) return
        if (raw.includes('//')) {
            return raw.split('//').filter(e => e !== '').map(item => this.deserialize(item))
        }

        if (raw.includes('@=')) {
            return raw.split('/').filter(e => e !== '').reduce((o, s) => {
                const [k, v] = s.split('@=')
                o[k] = this.deserialize(this.unescape(v))
                return o
            }, {})
        } else if (raw.includes('@A=')) {
            return this.deserialize(this.unescape(raw))
        } else {
            return raw.toString()
        }
    }
}

export {
    STT
}

// let a = new STT();
// a.deserialize(`type@=rquizisn/rid@=475252/qst@=1/qril@=qid@AA=4441661@ASqbid@AA=7341fe0a159617089038802172028@ASqt@AA=我的死亡数能否小于等于5@ASfon@AA=能@ASson@AA=不能@ASfbuid@AA=9985474@ASsbuid@AA=182243496@ASfbmc@AA=2360@ASsbmc@AA=4545@ASfolpc@AA=10@ASsolpc@AA=220@ASfobc@AA=440126@ASsobc@AA=39210@ASfbid@AA=109846265@ASsbid@AA=109846431@ASqs@AA=1@ASet@AA=-1@ASwo@AA=0@ASscs@AA=0@ASsuid@AA=25332273@ASsname@AA=孙悟空丨兰林汉@ASaktp@AA=10@ASft@AA=0@ASflagc@AA=0@AS@Sqid@AA=4441660@ASqbid@AA=7341fe0a159617089038802172028@ASqt@AA=比赛结果@ASfon@AA=赢@ASson@AA=输@ASfbuid@AA=0@ASsbuid@AA=136676242@ASfbmc@AA=0@ASsbmc@AA=35978@ASfolpc@AA=0@ASsolpc@AA=990@ASfobc@AA=1809968@ASsobc@AA=64078@ASfbid@AA=0@ASsbid@AA=109846387@ASqs@AA=1@ASet@AA=-1@ASwo@AA=0@ASscs@AA=0@ASsuid@AA=25332273@ASsname@AA=孙悟空丨兰林汉@ASaktp@AA=10@ASft@AA=0@ASflagc@AA=0@AS@Sqid@AA=4441659@ASqbid@AA=7341fe0a159617089038802172028@ASqt@AA=我的伤害能否全场第一@ASfon@AA=能@ASson@AA=不能@ASfbuid@AA=186024887@ASsbuid@AA=175701690@ASfbmc@AA=382@ASsbmc@AA=86040@ASfolpc@AA=510@ASsolpc@AA=10@ASfobc@AA=90719@ASsobc@AA=224159@ASfbid@AA=109846402@ASsbid@AA=109846396@ASqs@AA=1@ASet@AA=-1@ASwo@AA=0@ASscs@AA=0@ASsuid@AA=25332273@ASsname@AA=孙悟空丨兰林汉@ASaktp@AA=10@ASft@AA=0@ASflagc@AA=0@AS@S/`)
