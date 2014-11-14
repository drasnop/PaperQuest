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


citationPattern = re.compile('(.*)Cited by (\d+).*doi>([0-9\.]+/[0-9\.]+[0-9])')
# For our purposes, assume DOIs consist of numbers, dots and
# slashes. All the DOIs we're interested in match this pattern. The
# rest of the regex is meant to help clean the DOI from extra stuff
# that might have gotten attached to it in the initial pattern
# parsing.
doiPattern = re.compile(' *([0-9\.]+/[0-9\.]+[0-9]).*?')


def extractDOI(s):
    return doiPattern.findall(s)[0].strip('], ')

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print "You have to specify the file with the Kimono results"
        exit (1);

    results = None

    # Parse the contents of the input file into a Python
    # object. They're expected to be in JSON, as output by Kimono
    with open(sys.argv[1]) as input_file:
        results = json.loads(input_file.read())

    # Get rid of extra elements, keep just the actual results
    results = [r['result'] for r in results['results']['collection1']]

    # Filter out results that don't seem to contain citation count
    # information. We use regular expressions to search for both a
    # "Cited by" string and a "doi>" string.
    results = [citationPattern.findall(r['text'])[0]
               for r in results
               if citationPattern.search(r['text'])]

    counts = {}
    for r in results:
        counts[extractDOI(r[2])] = dict(title=r[0],
                                        citation_count=int(r[1]))

    print json.dumps(counts)
