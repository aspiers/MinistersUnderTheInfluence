from dateutil.parser import *
from datetime import *
import re

DATA_TYPES = ['gifts', 'hospitality', 'meetings', 'travel']
DEFAULT_YEAR = 1000 #  Dummy year that should never appear in actual data

class TypeNotFoundException(Exception):
    pass

class MultipleTypesFoundException(Exception):
    
    def __init__(self, type_keys):
        self.type_keys = type_keys

# Some csv files have the minister only in the first row and not in subsequent rows
# In this case, copy the minister's name whilst iterating down until the field is no
# longer blank
def clean_minister_column(lines):
    minister_name = lines[0][0]
    for l in lines:
        if (l[0] == ''):
            l[0] = minister_name
        else:
            minister_name = l[0]
    return lines

def has_year(newdate):
    if newdate.year != DEFAULT_YEAR:
        return newdate.year
    else:
        return None

def has_month(date, newdate):
    month_info = date.join(re.findall("[a-zA-Z]+", date))
    if len(month_info) != 0:
        return newdate.month
    else:
        return None

def has_day(date, newdate):
    numbers_present = [int(n) for n in date.split() if n.isdigit()]
    if ((newdate.year != DEFAULT_YEAR  and (len(numbers_present) == 2)) or (newdate.year == DEFAULT_YEAR and (len(numbers_present) == 1))):
        return newdate.day
    else:
        return None

def clean_date_for_row(row, year_hint=None):
    """
    Replace the date in the row with a cleaned version

    Assumes the date is in column two and replaces it's value with a cleaned
    version generated by calling `clean_date` on it.
    """
    row[1] = clean_date(row[1], year_hint)
    return row

def clean_dates(rows, year_hint=None):
    return [clean_date_for_row(row, year_hint) for row in rows]

def clean_date(date_string, year_hint=None):
    """
    Turn a string representation of a date into a dictionary

    Takes a string that is supposed to represent a date containing any of:
    - a two digit year
    - a four digit year
    - a month represented by digits
    - a month name that's been abbreviated
    - a month name in full
    - a day in digits
    Also takes an optional year as a hint to be used for the year if one cannot
    be found in the string.

    Returns:
    A dict containing:
    - Year: The year found in the string (or the hint year if none found)
    - Month: The month found in the string
    - Day: The day found in the string
    """
    if year_hint is None:
        year_hint = DEFAULT_YEAR
    # IMPORTANT: This method currently only expects dates of months with or without a year
    # Edge case included: Sept is not recognized so changed to Sep
    SEPT_PATTERN = re.compile("^sept$", flags=re.IGNORECASE) #RegEx to find "Sept" abbreviation
    DEFAULT = datetime(year_hint, 12, 01, 0, 0)  #  Default date for dateutil to fill in missing gaps

    if(len(date_string)==0):
        return {'Year': None, 'Month': None, 'Day': None}
    else:
        date_ = re.sub(SEPT_PATTERN, "Sep", date_string)
        newdate = parse(date_.replace("-"," of "), default=DEFAULT, dayfirst=True)
        return {'Year': has_year(newdate), 'Month': has_month(date_, newdate), 'Day': has_day(date_, newdate)}

def normalise(file_contents, year_hint=None):
    file_contents = clean_minister_column(file_contents)
    file_contents = clean_dates(file_contents, year_hint)
    return file_contents

def extract_info_from_filename(filename, type_strings=DATA_TYPES):
    """
    Look at a filename and attempt to extract the data type and year from it

    Does some simple searching in the filename for certain keywords that
    indicate what type of data the file may contain. A single data type needs
    to be found otherwise processing of the file would not be able to continue
    so an exception is raised in cases where 0 or 2+ types are found.
    Also looks to see if there's a year string in the filename, this could be
    either a two or four digit representation. The year is only needed to
    provide a hint to the date cleaning function later so it's not breaking if
    it's not there.

    Returns:
    A dict containing:
    - type: The data type of the file
    - year: A year this file may be referring to (or None if ambiguous)

    Raises:
    - TypeNotFoundException: if no data type identified
    - MultipleTypesFoundException: if more than one data type identified
    """
    type_keys = [type_ for type_ in type_strings if type_ in filename]
    if not type_keys:
        raise TypeNotFoundException()
    elif len(type_keys) > 1:
        raise MultipleTypesFoundException(type_keys)

    year = None
    years = []

    # Match four digit runs at the start that begin with 19 or 20
    matches = re.findall(r'\A((?:19|20)\d{2})(?:\Z|\D)', filename)
    if matches:
        years += [int(match) for match in matches]

    # Match four digit runs not at the start (must have a non-digit in front)
    # that begin with 19 or 20
    matches = re.findall(r'(?:\D)((?:19|20)\d{2})(?:\Z|\D)', filename)
    if matches:
        years += [int(match) for match in matches]

    # Match two digit runs at the start
    matches = re.findall(r'\A(\d{2})(?:\Z|\D)', filename)
    if matches:
        years += [2000 + int(match) for match in matches]

    # Match two digit runs not at the start (must have a non-digit in front)
    matches = re.findall(r'(?:\D)(\d{2})(?:\Z|\D)', filename)
    if matches:
        years += [2000 + int(match) for match in matches]

    if len(years) == 1:
        year = years[0]
        if year > date.today().year:
            year -= 100

    return {
        'year': year,
        'type': type_keys[0],
    }