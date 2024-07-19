enum BallColor {
    Blue = 0x2977d4,
    Green = 0x7eac49,
    Red = 0xdb4234,
    Yellow = 0xffd440,
    Purple = 0xad519d,

    Any = -1
}

const colorIsMatch = (first: BallColor, second: BallColor) => {
    if (first === BallColor.Any || second === BallColor.Any) {
        return true
    }

    return first === second
}

export default BallColor

export {
    colorIsMatch
}