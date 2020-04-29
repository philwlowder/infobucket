

#include <stdio.h>
#include <string.h>
#include <graph.h>

char tick[] = {
        '|', '|', '|', '|', '|', '|', '|', '|',
        '/', '/', '/', '/', '/', '/', '/', '/',
        '-', '-', '-', '-', '-', '-', '-', '-',
        '\\', '\\', '\\', '\\', '\\', '\\', '\\','\\',
        '|', '|', '|', '|', '|', '|', '|', '|',
        '/', '/', '/', '/', '/', '/', '/', '/',
        '-', '-', '-', '-', '-', '-', '-', '-',
        '\\', '\\', '\\', '\\', '\\', '\\', '\\', '\\' };

main(int argc, char *argv[])
{
     FILE *fptr;
     char *ch; char string[100]; char buffer[40];
     int ffeed = 0; int ctr = 0;
     float pages = 0; float plength = 0; float count = 0;
     long int words = 0; long int number = 0; long int totalnumber = 0;
     short save_cursor; short no_cursor = 0x2000;
     struct rccoord oldpos;


     if(argc == 1)               /* check # of arguments */
      {
          _clearscreen(_GCLEARSCREEN);
          printf(" DOCINFO reports on ASCII text files.\n\n");
          printf(" Format:  C:>docinfo filename.ext [n]\n");
          printf("     Where n is page length, defaults to 60\n\n");
          printf(" Pagelength is input by user or defaults to 60\n");
          printf(" Pages equal Lines divided by Pagelength\n");
          printf(" Formfeeds equal number of physical pages\n");
          printf(" Lines equal number of lines in document\n");
          printf(" Words equal Characters divided by 6\n");
          printf(" Characters equal total number of chars. in file\n");
          printf(" \n By Phil Lowder & Scott Dittmer -- Quick C 2.5\n");
          printf(" \n Copyright (c)  9/22/1991\n");
          exit();
      }
      else
           if(argc == 2)
                    plength = 60;
                    else
                    plength = atoi(argv[2]);
           if ((fptr=fopen(argv[1], "r")) == NULL)
                   {
                   printf("Can't open file %s.", argv[1]);
                   exit();
                   }
          save_cursor = _gettextcursor();
         _clearscreen(_GCLEARSCREEN);
         _settextposition(1,34);
           sprintf(buffer, "Docinfo v.2.0");
           _outtext(buffer);
           _settextposition(2,32);
           sprintf(buffer, "copyright (c) 1991");
           _outtext(buffer);
           _settextposition(3,26);
           sprintf(buffer, "by Phil Lowder & Scott Dittmer");
           _outtext(buffer);


         _settextcursor(no_cursor);
         _settextposition(8,20);
          sprintf(buffer,"Processing -- %s ---  ", strupr(argv[1]));
         _outtext(buffer);
          oldpos = _gettextposition();

         while ((fgets(string,100,fptr)) != NULL)    /* get characters */
               {
                    _settextposition( oldpos.row, oldpos.col - 1 );
                     sprintf(buffer,"%c",tick[++ctr]);
                    _outtext(buffer);

                     number = strlen(string); /* number of character in string */
                     totalnumber += number;
                     --totalnumber;      /* subtract 1 for newline character */

                     if ( ctr == 63 )
                     ctr = 0;
                     ++count;

                     if ((ch = strchr(string,'')) != NULL)
                     ++ffeed;
                }
         fclose(fptr);

         pages = count/plength;
         words = totalnumber/6;

          _settextposition( oldpos.row, oldpos.col - 1 );
          sprintf(buffer,"COMPLETE!!");
         _outtext(buffer);

         _settextposition(10,20);
          sprintf(buffer,"Page Length     %-.0f",plength);
          _outtext(buffer);

         _settextposition(11,20);
          sprintf(buffer,"Pages           %-.1f",pages);
         _outtext(buffer);

         _settextposition(12,20);
          sprintf(buffer,"Formfeeds       %-d",ffeed);
         _outtext(buffer);

         _settextposition(13,20);
          sprintf(buffer,"Lines           %-.0f",count);
         _outtext(buffer);

         _settextposition(14,20);
          sprintf(buffer,"Words           %-ld",words);
         _outtext(buffer);

         _settextposition(15,20);
          sprintf(buffer,"Characters      %-ld",totalnumber);
         _outtext(buffer);

         _settextposition(20,0);
         _settextcursor(save_cursor);
}
