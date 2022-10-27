class StringHelperService {
    public getWordCount(string: string): number {
        if (!string) {
            return 0;
        }
        return string.split(' ').length;
    }
}

export = new StringHelperService();
