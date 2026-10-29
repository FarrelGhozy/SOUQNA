import 'package:intl/intl.dart';

String formatIDR(num n) =>
    NumberFormat.currency(locale: 'id_ID', symbol: 'Rp', decimalDigits: 0).format(n);
