################################################################################
#
# Extracts citation counts from Google Search results, looking for
# specific patterns within the results. The scripts assumes it
# receives as input a file with a JSON array containing all the
# results, such as those returned by KimonoLabs. All results should be
# in the 'collection1', and they should all be called 'result'.

import json
import re
import sys


citationPattern = re.compile('(.*)Cited by (\d+).*')
# Extracts the DOI suffix of a publication from a dl.acm.org URL
doiACMSuffixPattern = re.compile('id=(\d+\.\d+|\d+)')

def extractDOI(s):
    return doiACMSuffixPattern.findall(s)[0]

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print "You have to specify the file with the Kimono results"
        exit (1);

    results = None

    # Parse the contents of the input file into a Python
    # object. They're expected to be in JSON, as output by Kimono
    with open(sys.argv[1]) as input_file:
        results = json.loads(input_file.read())

    # Get rid of extra elements, keep just the actual results. Keep
    # only those that have a URL pointing to the ACM digital
    # library. Filter out results that don't seem to contain citation
    # count information. We use regular expressions to search for a
    # "Cited by" string.
    results = [r['result']
               for r in results['results']['collection1']
               if (r['result']['href'].find('dl.acm') >= 0 and
                   citationPattern.search(r['result']['text']))]

    counts = {}
    for r in results:
        tmp = citationPattern.findall(r['text'])[0]
        # Use the DOI as extracted from the ACM DL URL for a key to
        # store the citation count.
        counts[extractDOI(r['href'])] = dict(title=tmp[0],
                                             citation_count=int(tmp[1]))

    print json.dumps(counts)
